import { useEffect, useState } from 'react';
import {
    getVisibleNotificationsForUser,
    markNotificationAsRead,
    markGroupNotificationsAsRead,
    markAllNotificationsAsRead,
    Notification,
    UserNotification
} from '../../../services/notificationService';
import { Loader2, X } from 'lucide-react';

interface GroupedNotification {
    groupKey: string;
    title: string;
    message: string;
    type: string;
    createdAt: string;
    group: UserNotification[];
}


const Notifications = () => {
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const fetchNotifications = async (pageNum = 1) => {
        setLoading(true);
        try {
            const res = await getVisibleNotificationsForUser(pageNum, 10);

            // Full map, respecting UserNotification shape
            const userNotifs: UserNotification[] = res.data.map((notif: any) => ({
                id: notif.id,
                userId: notif.userId,
                read: notif.read,
                readAt: notif.readAt,
                notification: {
                    id: notif.notification?.id ?? notif.id,
                    title: notif.notification?.title ?? notif.title,
                    message: notif.notification?.message ?? notif.message,
                    type: notif.notification?.type ?? notif.type,
                    createdAt: notif.notification?.createdAt ?? notif.createdAt,
                    userId: notif.notification?.userId ?? notif.userId, // ✅ Add this line
                },
            }));

            setNotifications(userNotifs);
            setTotalPages(res.totalPages);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        fetchNotifications(page);
    }, [page]);

    const groupNotifications = (notifs: UserNotification[]) => {
        const groups: Record<string, UserNotification[]> = {};

        for (const notif of notifs) {
            const { title, message, type } = notif.notification;
            const key = `${title}-${message}-${type}`;

            if (!groups[key]) {
                groups[key] = [];
            }

            groups[key].push(notif);
        }

        return Object.entries(groups).map(([key, group]) => ({
            groupKey: key,
            title: group[0].notification.title,
            message: group[0].notification.message,
            type: group[0].notification.type,
            createdAt: group[0].notification.createdAt,
            group,
        }));
    };


    const groupedNotifications = groupNotifications(notifications);

    const handleSingleClick = async (notif: UserNotification) => {
        if (notif.read) return;

        try {
            await markNotificationAsRead(notif.notification.id);

            setNotifications(prev =>
                prev.map(n =>
                    n.id === notif.id
                        ? { ...n, read: true, readAt: new Date().toISOString() }
                        : n
                )
            );
        } catch (err) {
            console.error('Error marking notification as read', err);
        };

    };

    const handleGroupClick = async (notifGroup: GroupedNotification) => {
        try {
            const isAlreadyRead = notifGroup.group.every(n => n.read);
            if (isAlreadyRead) return;

            await markGroupNotificationsAsRead(notifGroup.title, notifGroup.message, notifGroup.type);

            setNotifications(prev =>
                prev.map(n =>
                    n.notification.title === notifGroup.title &&
                        n.notification.message === notifGroup.message &&
                        n.notification.type === notifGroup.type
                        ? { ...n, read: true, readAt: new Date().toISOString() }
                        : n
                )
            );
        } catch (err) {
            console.error("Failed to mark group as read", err);
        }
    };


    const handleMarkAll = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setShowConfirmModal(false);
        } catch (err) {
            console.error("Failed to mark all notifications as read", err);
        }
    };

    const handlePrevious = () => {
        if (page > 1) setPage(prev => prev - 1);
    };

    const handleNext = () => {
        if (page < totalPages) setPage(prev => prev + 1);
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Notifications</h1>
                <button
                    onClick={() => setShowConfirmModal(true)}
                    className="text-white px-4 py-2 rounded-lg flex items-center gap-1 transition duration-200 bg-[#255199] hover:bg-[#2F66C1] shadow"
                >
                    Mark all as read
                </button>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                Confirm Action
                            </h2>
                            <button onClick={() => setShowConfirmModal(false)}>
                                <X className="w-5 h-5 text-gray-500 hover:text-gray-700 dark:hover:text-white" />
                            </button>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to mark all notifications as read?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleMarkAll}
                                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                            >
                                Yes, mark all
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Loader */}
            {loading ? (
                <div className="flex items-center justify-center py-10 text-gray-500 dark:text-gray-400">
                    <Loader2 className="animate-spin h-6 w-6 mr-2" />
                    Loading notifications...
                </div>
            ) : groupedNotifications.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400">No notifications available.</div>
            ) : (
                <>
                    {/* Notification List */}
                    <ul className="space-y-4 mb-6">
                        {groupedNotifications.map((grouped) => {
                            const isRead = grouped.group.every(n => n.read);
                            return (
                                <li
                                    key={grouped.groupKey}
                                    onClick={() =>
                                        grouped.group.length > 1
                                            ? handleGroupClick(grouped)
                                            : handleSingleClick(grouped.group[0])
                                    }
                                    className={`cursor-pointer p-4 rounded-lg border hover:shadow-md transition 
                                        ${isRead
                                            ? 'bg-gray-100 dark:bg-gray-800 opacity-60'
                                            : 'bg-white dark:bg-gray-900'} 
                                        border-gray-200 dark:border-gray-700`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{grouped.title}</h2>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(grouped.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{grouped.message}</p>
                                    <div className="mt-2">
                                        {isRead ? (
                                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">Read</span>
                                        ) : (
                                            <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Unread</span>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Pagination */}
                    <div className="flex justify-between items-center text-sm">
                        <button
                            onClick={handlePrevious}
                            disabled={page === 1}
                            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                        >
                            ← Previous
                        </button>
                        <span className="text-gray-600 dark:text-gray-300">Page {page} of {totalPages}</span>
                        <button
                            onClick={handleNext}
                            disabled={page === totalPages}
                            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                        >
                            Next →
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Notifications;
