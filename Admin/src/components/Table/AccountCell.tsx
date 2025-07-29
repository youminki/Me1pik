import React from 'react';

const AccountCell: React.FC<{ value: string; onClick?: () => void }> = ({ value, onClick }) => {
  return (
    <span
      style={{
        color: '#007bff',
        cursor: onClick ? 'pointer' : 'default',

        textDecoration: onClick ? 'underline' : 'none',
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick();
            }
          : undefined
      }
    >
      {value}
    </span>
  );
};

export default React.memo(AccountCell);
