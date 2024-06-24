import PropTypes from "prop-types";
import { useState, useRef, useEffect, useCallback } from "react";
import "./VirtualizedGrid.css";

const VirtualizedGrid = ({
  items,
  renderItem,
  loadMore,
  hasMore,
  isLoading,
  rowGap = 0,
  columnGap = 0,
  minColumnWidth = 250,
  overscan = 0,
}) => {
  const [visibleItems, setVisibleItems] = useState({
    list: [],
    offsetTop: 0,
    offsetBottom: 0,
  });
  const [itemDimensions, setItemDimensions] = useState({ width: 0, height: 0 });
  const [isScrolling, setIsScrolling] = useState(false);

  const gridRef = useRef(null);
  const gridWrapperRef = useRef(null);
  const lastElementRef = useRef(null);
  const measureRef = useRef(null);
  const timeoutRef = useRef(null);

  const measureItemDimensions = useCallback(() => {
    if (measureRef.current) {
      const { width, height } = measureRef.current.getBoundingClientRect();
      setItemDimensions({ width, height });
    }
  }, []);

  const calculateVisibleItems = useCallback(() => {
    const { scrollTop, clientHeight, clientWidth } = gridRef.current;

    if (itemDimensions.height === 0 || itemDimensions.width === 0) {
      return;
    }

    const firstElement =
      gridWrapperRef?.current?.lastChild?.getBoundingClientRect();

    const itemElementHeight = firstElement?.height || itemDimensions.height;
    const itemElementWidth = firstElement?.width || itemDimensions.width;

    const columns = Math.floor(
      (clientWidth + columnGap) / parseInt(itemElementWidth + columnGap)
    );

    const rows =
      Math.ceil(clientHeight / (itemElementHeight + rowGap)) + 2 + 2 * overscan;

    const lastPossibleRowIndex = Math.ceil(items.length / columns) - 1;

    const startRowIdx =
      Math.floor(scrollTop / (itemElementHeight + rowGap)) - overscan - 1 < 0
        ? 0
        : Math.floor(scrollTop / (itemElementHeight + rowGap)) - overscan - 1;

    const endRowIdx =
      lastPossibleRowIndex <= startRowIdx + rows - 1
        ? lastPossibleRowIndex
        : startRowIdx + rows - 1;

    const firstItemIdx = startRowIdx * columns;
    const lastItemIdx = (endRowIdx + 1) * columns - 1;

    const visibleItems = items
      .slice(firstItemIdx, lastItemIdx + 1)
      .map((ele, index) => ({ item: ele, idx: firstItemIdx + index })); // + 1 because slice excludes last index

    setVisibleItems(() => {
      return {
        list: visibleItems,
        offsetTop: startRowIdx * (itemElementHeight + rowGap),
        offsetBottom:
          (lastPossibleRowIndex - endRowIdx) * (itemElementHeight + rowGap),
      };
    });
  }, [
    columnGap,
    itemDimensions.height,
    itemDimensions.width,
    items,
    overscan,
    rowGap,
  ]);

  const handleScroll = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      if (!isScrolling) {
        setIsScrolling(true);
      }
    }

    if (isLoading && !hasMore) {
      return;
    }

    calculateVisibleItems();
    timeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 70);
  }, [calculateVisibleItems, hasMore, isLoading, isScrolling]);

  useEffect(() => {
    measureItemDimensions();
    window.addEventListener("resize", measureItemDimensions);
    window.addEventListener("resize", calculateVisibleItems);
    return () => {
      window.removeEventListener("resize", measureItemDimensions);
      window.removeEventListener("resize", calculateVisibleItems);
    };
  }, [calculateVisibleItems, measureItemDimensions]);

  useEffect(() => {
    calculateVisibleItems();
  }, [calculateVisibleItems, itemDimensions]);

  useEffect(() => {
    const gridElement = gridRef.current;
    if (gridElement) {
      gridElement.addEventListener("scroll", handleScroll);
      return () => {
        gridElement.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll]);

  useEffect(() => {
    if (isLoading && !hasMore) {
      return;
    }
    if (lastElementRef && lastElementRef.current) {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      });
      const element = lastElementRef.current;
      observer.observe(element);

      return () => {
        if (element) observer.unobserve(element);
      };
    }
  }, [hasMore, isLoading, loadMore, visibleItems]);

  return (
    <>
      <div ref={gridRef} className="grid-container">
        {items.length > 0 && (
          <div
            style={{
              gridTemplateColumns: `repeat(auto-fill, minmax(${minColumnWidth}px, 1fr))`,
              rowGap,
              columnGap,
            }}
            className="dummy-grid"
          >
            <div ref={measureRef} className="dummyDiv">
              {renderItem({ item: items[0], isScrolling: false })}
            </div>
          </div>
        )}
        <div className="virtualized-grid-wrapper">
          <div
            ref={gridWrapperRef}
            className="virtualized-grid"
            style={{
              paddingTop: visibleItems.offsetTop,
              paddingBottom: visibleItems.offsetBottom,
              gridTemplateColumns: `repeat(auto-fill, minmax(${minColumnWidth}px, 1fr))`,
              rowGap,
              columnGap,
            }}
          >
            {visibleItems.list.length > 0 &&
              visibleItems.list.map((visibleItem) => (
                <div
                  ref={
                    visibleItem.idx === items.length - 1 ? lastElementRef : null
                  }
                  key={visibleItem.idx}
                >
                  {renderItem({ item: visibleItem.item, isScrolling })}
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

VirtualizedGrid.propTypes = {
  items: PropTypes.array,
  renderItem: PropTypes.func,
  loadMore: PropTypes.func,
  hasMore: PropTypes.bool,
  isLoading: PropTypes.bool,
  rowGap: PropTypes.number,
  columnGap: PropTypes.number,
  minColumnWidth: PropTypes.number,
  overscan: PropTypes.number,
};

export default VirtualizedGrid;
