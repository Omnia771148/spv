'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Loading from "../../loading/page";

export default function InvoicePage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        // Use the correct API endpoint - just /api/final-orders/[id]
        const res = await axios.get(`/api/final-orders/${id}`);
        console.log("Invoice data:", res.data);
        setOrder(res.data);
        setError("");
      } catch (err) {
        console.error("Error fetching invoice:", err);
        setError("Failed to load invoice. Please try again.");
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    window.history.back();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: '#d32f2f' }}>Error Loading Invoice</h2>
        <p style={{ margin: '20px 0' }}>{error}</p>
        <button
          onClick={handleClose}
          style={{
            padding: '10px 20px',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Invoice Not Found</h2>
        <p>No order found with the provided ID.</p>
        <button
          onClick={handleClose}
          style={{
            padding: '10px 20px',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F8F5EB', minHeight: '100vh', padding: '20px 0' }}>
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '30px',
        background: 'white',
        boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
        fontFamily: 'Arial, sans-serif',
        borderRadius: '8px'
      }}>
        {/* Invoice Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '2px solid #e63946'
        }}>
          <h1 style={{
            color: '#e63946',
            margin: '0 0 10px 0',
            fontSize: '28px'
          }}>🍽️ Restaurant Invoice</h1>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginTop: '20px'
          }}>
            <div>
              <p style={{ margin: '5px 0', fontWeight: 'bold' }}>INVOICE #</p>
              <p style={{ margin: '5px 0' }}>{order.orderId}</p>
            </div>
            <div>
              <p style={{ margin: '5px 0', fontWeight: 'bold' }}>DATE</p>
              <p style={{ margin: '5px 0' }}>
                {new Date(order.orderDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p style={{ margin: '5px 0', fontWeight: 'bold' }}>TIME</p>
              <p style={{ margin: '5px 0' }}>
                {new Date(order.orderDate).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{
            color: '#333',
            marginBottom: '10px',
            borderLeft: '4px solid #457b9d',
            paddingLeft: '10px'
          }}>Customer Information</h3>
          <div style={{
            background: '#f8f9fa',
            padding: '15px',
            borderRadius: '6px'
          }}>
            <p style={{ margin: '8px 0' }}>
              <strong>Customer ID:</strong> {order.userId}
            </p>
            {order.location?.address && (
              <p style={{ margin: '8px 0' }}>
                <strong>Delivery Address:</strong> {order.location.address}
              </p>
            )}
          </div>
        </div>

        {/* Order Items Table */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{
            color: '#333',
            marginBottom: '15px',
            borderLeft: '4px solid #457b9d',
            paddingLeft: '10px'
          }}>Order Items</h3>
          <div style={{
            overflow: 'hidden',
            borderRadius: '6px',
            border: '1px solid #e0e0e0'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1d3557', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Item</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Price</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{item.name}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>₹{formatCurrency(item.price)}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>₹{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing Summary */}
        <div style={{
          marginBottom: '25px',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div style={{
            width: '300px',
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px dashed #ddd'
            }}>
              <span>Subtotal:</span>
              <span>₹{formatCurrency(order.totalPrice)}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px dashed #ddd'
            }}>
              <span>GST ({order.gst ? ((order.gst / order.totalPrice) * 100).toFixed(1) : '0'}%):</span>
              <span>₹{formatCurrency(order.gst)}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px dashed #ddd'
            }}>
              <span>Delivery Charge:</span>
              <span>₹{formatCurrency(order.deliveryCharge)}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '15px 0 0',
              marginTop: '10px',
              borderTop: '2px solid #1d3557',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              <strong>Grand Total:</strong>
              <strong>₹{formatCurrency(order.grandTotal)}</strong>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{
            color: '#333',
            marginBottom: '10px',
            borderLeft: '4px solid #457b9d',
            paddingLeft: '10px'
          }}>Payment Information</h3>
          <div style={{
            background: '#f8f9fa',
            padding: '15px',
            borderRadius: '6px'
          }}>
            <p style={{ margin: '8px 0' }}>
              <strong>Payment Status:</strong>
              <span style={{
                marginLeft: '10px',
                padding: '4px 12px',
                borderRadius: '20px',
                background: order.paymentStatus === 'Completed' ? '#2ecc71' : '#f39c12',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {order.paymentStatus}
              </span>
            </p>
            {order.razorpayPaymentId && (
              <p style={{ margin: '8px 0' }}>
                <strong>Transaction ID:</strong> {order.razorpayPaymentId}
              </p>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {order.restaurantId && (
            <div>
              <h4 style={{ color: '#555', marginBottom: '5px' }}>Restaurant ID</h4>
              <p style={{ margin: 0 }}>{order.restaurantId}</p>
            </div>
          )}
          {order.deliveryBoyId && (
            <div>
              <h4 style={{ color: '#555', marginBottom: '5px' }}>Delivery Agent</h4>
              <p style={{ margin: 0 }}>{order.deliveryBoyId}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '2px dashed #ddd',
          color: '#666'
        }}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#4CAF50' }}>
            Thank you for your order! 🍕
          </p>
          <p style={{ fontSize: '12px', marginTop: '10px' }}>
            This is a computer-generated invoice. No signature required.
          </p>
        </div>

        {/* Print and Close Buttons (Bottom) */}
        <div className="no-print" style={{
          marginTop: '30px',
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          borderTop: '1px solid #eee',
          paddingTop: '20px'
        }}>
          <button
            onClick={handlePrint}
            style={{
              padding: '12px 25px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            🖨️ Print Invoice
          </button>
          <button
            onClick={handleClose}
            style={{
              padding: '12px 25px',
              background: '#757575',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}