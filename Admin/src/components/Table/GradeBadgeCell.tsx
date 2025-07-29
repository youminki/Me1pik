import React from 'react';

const GradeBadgeCell: React.FC<{ grade: string }> = ({ grade }) => {
  return <span>{grade}</span>;
};

export default React.memo(GradeBadgeCell);
