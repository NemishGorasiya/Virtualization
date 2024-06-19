import VirtualizedGrid from "./components/VirtualizedGrid";
import "./App.css";

const App = () => {
	const items = Array.from({ length: 1000 }, (_, index) => `Item ${index + 1}`);

	const renderItem = (item) => {
		console.log("in render", item);
		return (
			<div style={{ padding: "20px", border: "1px solid #ccc" }}>{item}</div>
		);
	};

	const gridStyles = {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
		gap: "10px",
		padding: "10px",
	};

	return (
		<div style={{ height: "100vh", width: "100%" }}>
			<VirtualizedGrid
				items={items}
				renderItem={renderItem}
				gridStyles={gridStyles}
			/>
		</div>
	);
};

export default App;
