import PropTypes from "prop-types";
import "./GridItem.css";

const GridItem = ({ item, isScrolling }) => {
  const { id } = item || {};
  return isScrolling ? (
    <div className="placeholder" />
  ) : (
    <div className="grid-item">
      <div className="grid-image-wrapper">
        <img
          src={`https://picsum.photos/id/${id}/200/300`}
          alt="Grid item image"
        />
      </div>
    </div>
  );
};

GridItem.propTypes = {
  item: PropTypes.any,
  isScrolling: PropTypes.bool,
};

export default GridItem;
