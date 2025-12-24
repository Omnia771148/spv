{/* 1. Item List */}
{cartItems.length === 0 ? (
  <p className="text-center mt-5 text-muted">No items in the cart.</p>
) : (
  <ul className="list-unstyled">
    {cartItems.map(item => (
      <li key={item.id}>
        <DisCart 
          name={item.name} 
          price={item.price} 
          handleRemove={() => removeItem(item.id)} 
          // logic for total change here
        />
      </li>
    ))}
  </ul>
)}

{/* 2. Bill Details (Only shows if items exist) */}
{cartItems.length > 0 && (
  <>
    <div className="card shadow-sm mt-4 border-0">
      <div className="card-body">
        <h5>Bill Details</h5>
        <div className="d-flex justify-content-between">
          <span>Item Total</span>
          <span>₹{totalPrice.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between">
          <span>GST (5%)</span>
          <span>₹{gstAmount.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between">
          <span>Delivery Charge</span>
          <span>₹{deliveryCharge.toFixed(2)}</span>
        </div>
        <hr />
        <div className="d-flex justify-content-between fw-bold text-primary">
          <span>Grand Total</span>
          <span>₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="mt-3">
      <button onClick={clear} className="btn btn-warning me-2">Clear All</button>
      <button onClick={placeOrder} className="btn btn-primary">Pay & Place Order</button>
    </div>
  </>
)}