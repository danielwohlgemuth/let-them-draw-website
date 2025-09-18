import { useRouter } from 'next/router';
import styles from './RequestCard.module.css';

interface RequestCardProps {
  request: {
    requestId: string;
    status: string;
    requestDate: string;
    requirements: {
      shape: string;
      color: string;
    };
  };
}

export default function RequestCard({ request }: RequestCardProps) {
  const router = useRouter();

  return (
    <div
      className={styles.requestCard}
      onClick={() => router.push(`/artwork/${request.requestId}`)}
    >
      <div className={styles.requestHeader}>
        <span className={styles.requestId}>#{request.requestId}</span>
        <span className={`${styles.status} ${styles[`status-${request.status.replace(' ', '-')}`]}`}>
          {request.status}
        </span>
      </div>
      <div className={styles.requestDate}>
        {new Date(request.requestDate).toLocaleString()}
      </div>
      <div className={styles.requirements}>
        <div className={styles.requirementItem}>
          <span className={styles.requirementLabel}>Shape: </span>
          <span className={styles.requirementValue}>{request.requirements.shape}</span>
        </div>
        <div className={styles.requirementItem}>
          <span className={styles.requirementLabel}>Color: </span>
          <span className={styles.requirementValue}>{request.requirements.color}</span>
        </div>
      </div>
    </div>
  );
}
