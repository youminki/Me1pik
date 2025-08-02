import React from 'react';

const StatusBadgeCell: React.FC<{ status: string }> = ({ status }) => {
  return <span>{status}</span>;
};

export default React.memo(StatusBadgeCell);
