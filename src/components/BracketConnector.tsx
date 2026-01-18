import React from 'react';

interface BracketConnectorProps {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

const BracketConnector: React.FC<BracketConnectorProps> = ({ startX, startY, endX, endY }) => {
    // Calculate path
    // We want a curve that goes horizontal, then bends vertical, then horizontal again to enter the next node
    // Simple S-curve or step

    // Control points for nice Bezier
    const midX = (startX + endX) / 2;

    const path = `
        M ${startX} ${startY}
        C ${midX} ${startY},
          ${midX} ${endY},
          ${endX} ${endY}
    `;

    return (
        <path
            d={path}
            fill="none"
            stroke="#E4E4E4"
            strokeWidth="2"
            className="transition-all hover:stroke-[var(--primary)] hover:stroke-[3px]"
        />
    );
};

export default BracketConnector;
