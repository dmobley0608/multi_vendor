import React from 'react';

export default function SalesStats({ sales }) {
    const formatCurrency = (amount) => `$${(amount / 100).toFixed(2)}`;

    return (
        <div className="border rounded p-3 mb-3">
            <h4>Sales Statistics</h4>
            <p><strong>All Time Sales:</strong> {formatCurrency(sales?.allTime?.totalAmount || 0)}</p>
            <p><strong>Yearly Sales:</strong> {formatCurrency(sales?.yearly?.totalAmount || 0)}</p>
            <p><strong>Monthly Sales:</strong> {formatCurrency(sales?.monthly?.totalAmount || 0)}</p>
            <p><strong>Weekly Sales:</strong> {formatCurrency(sales?.weekly?.totalAmount || 0)}</p>
            <p><strong>Daily Sales:</strong> {formatCurrency(sales?.daily?.totalAmount || 0)}</p>
        </div>
    );
}
