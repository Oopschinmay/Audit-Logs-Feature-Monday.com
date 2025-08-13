import React, { useEffect, useState } from "react";
import { Loader, Heading } from "@vibe/core";
import { formatDistanceToNow } from "date-fns";
import styles from "./audit-log-view.module.scss";

const AuditLogView = ({ isAdmin = true }) => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAdmin) fetchAuditLogs();
  }, [isAdmin]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:4000/api/audit-logs");
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setLogs(data.data || []);
    } catch (err) {
      console.error("Audit log fetch error:", err);
      setError("Failed to fetch audit logs.");
    } finally {
      setLoading(false);
    }
  };

  const getLogsByWorkspaceAndEvent = () => {
    const grouped = {};
    logs.forEach((log) => {
      const workspace = log.activity_metadata?.workspace_name || "Other";
      const event = log.event || "Other";

      if (!grouped[workspace]) grouped[workspace] = {};
      if (!grouped[workspace][event]) grouped[workspace][event] = [];

      grouped[workspace][event].push(log);
    });
    return grouped;
  };

  if (!isAdmin) {
    return (
      <div className={styles.notAuthorized}>
        <Heading type="h3">Access Denied</Heading>
        <p>You do not have permission to view audit logs.</p>
      </div>
    );
  }

  const logsByWorkspace = getLogsByWorkspaceAndEvent();

  return (
    <div className={styles.auditLogView}>
      <Heading type="h1" className={styles.mainHeading}>
        Audit Logs
      </Heading>

      {loading ? (
        <Loader size={48} />
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : Object.keys(logsByWorkspace).length === 0 ? (
        <div className={styles.noLogs}>No audit logs found.</div>
      ) : (
        <div className={styles.workspaceContainer}>
          {Object.entries(logsByWorkspace).map(([workspaceName, events]) => (
            <div key={workspaceName} className={styles.workspaceSection}>
              <h2 className={styles.workspaceTitle}>{workspaceName}</h2>
              {Object.entries(events).map(([eventType, eventLogs]) => (
                <div key={eventType} className={styles.eventSection}>
                  <h3 className={styles.eventTitle}>{eventType}</h3>
                  <ul className={styles.logList}>
                    {eventLogs.map((log, index) => {
                      const timestamp = new Date(log.timestamp);
                      const relativeTime = formatDistanceToNow(timestamp, { addSuffix: true });
                      const exactTime = timestamp.toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        timeZoneName: "short",
                        hour12: true,
                      });

                      return (
                        <li key={index} className={styles.logItem}>
                          <div className={styles.logHeader}>
                            <span className={styles.userId}>
                              <strong>User ID:</strong> {log.user_id + " "} 

                            </span>
                            <span className={styles.timestamp} title={exactTime}>
                              {relativeTime} ({exactTime})
                            </span>
                          </div>
                          <div className={styles.logDetails}>
                            {log.activity_metadata?.board_name && (
                              <div>
                                <strong>Board:</strong> {log.activity_metadata.board_name}
                              </div>
                            )}
                            {log.activity_metadata?.item_name && (
                              <div>
                                <strong>Item:</strong> {log.activity_metadata.item_name}
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditLogView;
