import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * GET /api/alerts
 * Get user's alerts/notifications
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user'
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const alerts = await db.alert.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const unreadCount = await db.alert.count({
      where: {
        userId,
        isRead: false,
      },
    })

    return NextResponse.json({
      success: true,
      alerts,
      unreadCount,
    })
  } catch (error) {
    console.error('Get alerts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/alerts
 * Create a new alert
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId = 'demo-user', type, title, message, data } = body

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const alert = await db.alert.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : null,
      },
    })

    return NextResponse.json({
      success: true,
      alert,
    })
  } catch (error) {
    console.error('Create alert error:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/alerts
 * Mark alert(s) as read
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { alertId, markAllRead, userId = 'demo-user' } = body

    if (markAllRead) {
      await db.alert.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      })

      return NextResponse.json({
        success: true,
        message: 'All alerts marked as read',
      })
    }

    if (alertId) {
      await db.alert.update({
        where: { id: alertId },
        data: { isRead: true },
      })

      return NextResponse.json({
        success: true,
        message: 'Alert marked as read',
      })
    }

    return NextResponse.json(
      { error: 'Missing alertId or markAllRead' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Update alert error:', error)
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}
