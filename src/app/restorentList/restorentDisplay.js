export default function RestorentDisplay({ name, place, rating,image }) {
  return (
    <div className="rest-card-main">
      <div className="rest-card-main2">
        <img 
          src={image} 
          alt={name} 
          className="rest-image" 
          style={{ width: "100%", borderRadius: "10px" }} 
        />
        <h3 className="rest-title">{name}</h3>
        <h6>{place}</h6>
        <div className="rest-rating badge bg-success"> ⭐{rating}</div>
        
        
      </div>
    </div>
  )
}