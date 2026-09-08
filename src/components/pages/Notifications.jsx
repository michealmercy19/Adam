import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext.jsx';
import { Badge, Pill, Card } from '../common/UI.jsx';

const normalize = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

export default function Notifications() {
  const { currentRole, userProfile, notifications, setNotifications } = useContext(AppContext);
  const visibleNotifications = useMemo(() => notifications.filter((notification) => {
    if (notification.audienceRole && notification.audienceRole !== 'all' && notification.audienceRole !== currentRole) return false;
    if (currentRole === 'student' && notification.audienceId && normalize(notification.audienceId) !== normalize(userProfile?.id || 'FUNAAB/IT/24/001')) return false;
    if (currentRole === 'hoc' && notification.audienceDepartment && normalize(notification.audienceDepartment) !== normalize(userProfile?.department)) return false;
    if (notification.audienceProgramme && userProfile?.programme && normalize(notification.audienceProgramme) !== normalize(userProfile.programme)) return false;
    return true;
  }), [currentRole, notifications, userProfile]);

  const markAsSeen = (notificationId) => {
    setNotifications((current) => current.filter((notification) => notification.id !== notificationId));
  };

  return (
    <>
      <div className="top">
        <div className="title">
          <h1>Notifications</h1>
          <p>Messages about your course requests and department activity</p>
        </div>
        <Pill text={`${visibleNotifications.filter((notification) => !notification.seenAt).length} unseen`} />
      </div>
      <Card className="section notification-list">
        {visibleNotifications.length ? visibleNotifications.map((notification) => (
          <article className={`notification-item ${notification.seenAt ? 'seen' : 'unseen'}`} key={notification.id} onClick={() => !notification.seenAt && markAsSeen(notification.id)}>
            <div>
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
              <small className="muted">{new Date(notification.createdAt).toLocaleString()}</small>
            </div>
            <div className="notification-actions">
              <Badge text={notification.seenAt ? 'Seen' : 'New'} type={notification.seenAt ? 'good' : 'pending'} />
              {!notification.seenAt && <button type="button" className="notification-seen" onClick={(event) => { event.stopPropagation(); markAsSeen(notification.id); }}>Mark as seen</button>}
            </div>
          </article>
        )) : <p className="muted">You have no notifications yet.</p>}
      </Card>
    </>
  );
}
