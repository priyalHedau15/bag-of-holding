import { useBreakpointValue } from "@chakra-ui/media-query";
import { chakra } from "@chakra-ui/system";
import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import InventoryItemFields from "../../types/InventoryItemFields";

const numericTableCellProps = {
	paddingX: 2,
	sx: { textAlign: "center" },
};

const col4Props = {
	display: ["none", "table-cell"],
};

const col5Props = {
	display: ["none", "none", "table-cell"],
};

const InventorySheetTableHeaders = chakra(Th, {
	baseStyle: { color: "gray.50" },
});

export interface InventorySheetTableProps {
	items: InventoryItemFields[];
	compactMode: boolean;
	onRowClick: (item?: InventoryItemFields) => void;
}

/**
 * Table that shows items in a sheet inventory
 *
 * @param {object} props Component props
 * @param {InventoryItemFields[]} props.items The items in the inventory
 * @param {Function} props.onRowClick Callback to execute when an item row is clicked.
 * The item's fields are passed as a parameter
 * @returns {React.ReactElement} The rendered html components
 */
const InventorySheetTable: React.FC<InventorySheetTableProps> = ({
	items,
	onRowClick,
}) => {
	const totalWeightLabelColSpan = useBreakpointValue([2, 3, 4]);
	return (
		<Table colorScheme="gray">
			<Thead>
				<Tr backgroundColor="primary.500">
					<InventorySheetTableHeaders>Name</InventorySheetTableHeaders>
					<InventorySheetTableHeaders {...numericTableCellProps}>
						Quantity
					</InventorySheetTableHeaders>
					<InventorySheetTableHeaders {...numericTableCellProps}>
						Weight*
					</InventorySheetTableHeaders>
					<InventorySheetTableHeaders
						display={["none", "table-cell"]}
						{...numericTableCellProps}
						{...col4Props}
					>
						Value
					</InventorySheetTableHeaders>
					<InventorySheetTableHeaders
						display={["none", "table-cell"]}
						{...numericTableCellProps}
						{...col5Props}
					>
						Carried By
					</InventorySheetTableHeaders>
				</Tr>
			</Thead>
			<Tbody>
				{items.map((item) => (
					<Tr
						key={item._id}
						onClick={() => onRowClick(item)}
						cursor="pointer"
						_hover={{ backgroundColor: "gray.100" }}
					>
						<Td>{item.name}</Td>
						<Td {...numericTableCellProps}>{item.quantity}</Td>
						<Td {...numericTableCellProps}>{item.weight * item.quantity}</Td>
						<Td {...numericTableCellProps} {...col4Props}>
							{item.value}
						</Td>
						<Td {...numericTableCellProps} {...col5Props}>
							{item.carriedBy || "Nobody"}
						</Td>
					</Tr>
				))}
				<Tr>
					<Td
						// colSpan={totalWeightLabelColSpan}
						colSpan={2}
						fontWeight="bold"
						textAlign="right"
					>
						Total
					</Td>
					<Td {...numericTableCellProps}>
						{items.reduce<number>(
							(accumulator, item) => accumulator + item.weight * item.quantity,
							0
						)}
					</Td>
					<Td {...numericTableCellProps} {...col4Props}>
						{items.reduce<number>(
							(accumulator, item) => accumulator + item.value * item.quantity,
							0
						)}
					</Td>
					<Td {...col5Props} />
				</Tr>
			</Tbody>
		</Table>
	);
};

export default InventorySheetTable;
