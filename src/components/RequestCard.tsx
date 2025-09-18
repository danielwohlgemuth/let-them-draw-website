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
        <strong>Requirements:</strong>
        <ul>
          <li>Shape: {request.requirements.shape}</li>
          <li>Color: {request.requirements.color}</li>
        </ul>
      </div>
    </div>
  );
}
