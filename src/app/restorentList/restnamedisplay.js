export default function RestorentDisplay({ data }) {

  return (
    <div className="food-wrapper">
      <div className="row food-card align-items-center">

        <div className="col-8 content-section">
          <h6>{data.name}</h6>
          <small>{data.location}</small>

          <div>⭐ {data.rating}</div>

          <span className="badge bg-success">
            {data.Type} 
          </span>
        </div>

        <div className="col-4 image-section">
          <img src={data.image} alt={data.name} />
        </div>

      </div>
    </div>
  );
}
