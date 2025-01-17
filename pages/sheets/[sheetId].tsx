import { Button, IconButton } from "@chakra-ui/button";
import { useInterval } from "@chakra-ui/hooks";
import {
	Box,
	Center,
	Divider,
	Flex,
	Heading,
	SimpleGrid,
	Stack,
} from "@chakra-ui/layout";
import { Reducer, useEffect, useReducer } from "react";
import ItemDialog from "../../components/domain/SheetPage/Dialogs/ItemDialog";
import InventorySheetFields from "../../types/InventorySheetFields";
import InventorySheetState, {
	InventorySheetStateAction,
} from "../../types/InventorySheetState";
import getUrlParam from "../../utils/getUrlParam";
import SheetStateProvider from "../../components/contexts/InventoryStateContext";
import { REFETCH_INTERVAL } from "../../config/publicEnv";
import { GetServerSideProps } from "next";
import SheetOptionsDialog from "../../components/domain/SheetPage/Dialogs/SheetOptionsDialog";
import { AddIcon, CreateOutlineIcon } from "chakra-ui-ionicons";
import MemberCarryWeightTable from "../../components/domain/SheetPage/MemberCarryWeightTable";
import ColorModeSwitch from "../../components/ui/ColorModeSwitch";
import { Input } from "@chakra-ui/input";
import deepEqual from "deep-equal";
import { appName } from "../../constants/branding";
import FilterDialog from "../../components/domain/SheetPage/Dialogs/FilterDialog";
import InventorySheetTable from "../../components/domain/SheetPage/InventorySheetTable";
import { addToRememberedSheets } from "../../utils/rememberSheets";
import inventoryReducer from "../../state/inventoryReducer";
import { useSheetPageState } from "../../state/sheetPageState";
import { LightMode } from "@chakra-ui/color-mode";
import PartyMemberTagList from "../../components/templates/PartyMemberTagList";
import Meta from "../../components/templates/Meta";
import getSheetLink from "../../utils/getSheetLink";
import { H3 } from "../../components/ui/Typography";
import fetchSheetFromDb from "../../db/fetchSheetFromDb";
import fetchSheet from "../../services/fetchSheet";
import { Tag, TagLabel, TagLeftIcon } from "@chakra-ui/tag";
import WelcomeDialog from "../../components/domain/SheetPage/Dialogs/WelcomeDialog";
import { testIdGeneratorFactory } from "../../utils/testUtils";

const getTestId = testIdGeneratorFactory("SheetPage");

export const sheetPageTestIds = {
	colorModeButton: getTestId("ColorModeButton"),
	sheetOptionsButton: getTestId("SheetOptionsButton"),
};

export interface SheetPageProps extends InventorySheetFields {
	isNew?: boolean;
}

/**
 * The page for a specific sheet
 *
 * @param {InventorySheetFields} sheetFields The component sheetFields
 * @param {boolean} [sheetFields.isNew=false] Whether or not the sheet is newly created
 * @param {string} sheetFields.name The name of the sheet
 * @param {InventoryItemFields[]} sheetFields.items The items in the sheet
 * @param {string[]} sheetFields.members Members
 * @returns {React.ReactElement} Sheet component
 */
const Sheet: React.FC<SheetPageProps> = ({ isNew = false, ...sheetFields }) => {
	const [{ items, name, members, _id }, inventoryDispatch] = useReducer<
		Reducer<InventorySheetState, InventorySheetStateAction>
	>(inventoryReducer, {
		...sheetFields,
		blockRefetch: {
			for: 0,
			from: new Date(),
		},
	});

	useEffect(() => {
		if (isNew) {
			openDialog("welcome");
			//? Open the welcome dialog if the sheet is new
		}
	}, []);

	useEffect(() => {
		addToRememberedSheets({ _id, name, members });
		//? Store the sheet to the list of 'remembered' sheets
	}, [_id, name, members]);

	const {
		openDialog,
		searchbarValue,
		searchbarOnChange,
		resetFilters,
	} = useSheetPageState();

	/**
	 * Refetch the data regularly
	 */
	useInterval(() => {
		fetchSheet(sheetFields._id).then(({ data }) => {
			if (
				!deepEqual(items, data.items) ||
				!deepEqual(name, data.name) ||
				!deepEqual(members, data.members)
			)
				inventoryDispatch({ type: "sheet_update", data });
		});
	}, REFETCH_INTERVAL);

	return (
		<>
			<Meta
				title={appName + " - " + name}
				url={getSheetLink(sheetFields._id, true)}
			/>
			<SheetStateProvider
				dispatch={inventoryDispatch}
				state={{ items, members, name, _id }}
			>
				<Box>
					<main>
						{/* Top Bar */}
						<Box
							padding={2}
							backgroundColor="gray.900"
							color="gray.50"
							boxShadow="lg"
						>
							<Flex justify="space-between" marginBottom="group">
								<Flex>
									{/* Sheet Title */}
									<Heading marginRight={1}>{name}</Heading>
									{/* Sheet Options Button */}
									<IconButton
										aria-label="edit sheet settings"
										icon={<CreateOutlineIcon boxSize={6} />}
										onClick={() => openDialog("sheetOptions")}
										variant="ghost"
										isRound
										data-testid={sheetPageTestIds.sheetOptionsButton}
									/>
								</Flex>
								{/* Color Mode Switch */}
								<ColorModeSwitch
									useDarkModeColors
									data-testid={sheetPageTestIds.colorModeButton}
								/>
							</Flex>
							<LightMode>
								{members.length ? (
									<PartyMemberTagList members={members} />
								) : (
									<Tag
										_hover={{ backgroundColor: "gray.300" }}
										cursor="pointer"
										onClick={() => openDialog("sheetOptions")}
									>
										<TagLeftIcon as={AddIcon} />
										<TagLabel>Add Members</TagLabel>
									</Tag>
								)}
							</LightMode>
						</Box>
						<Stack
							minHeight={16}
							columns={3}
							padding="group"
							direction={["column-reverse", "column-reverse", "row"]}
						>
							<Box>
								{/* Add new Item Button */}
								<Button
									colorScheme="primary"
									onClick={() => openDialog("item.new")}
									width="full"
								>
									Add New Item
								</Button>
							</Box>
							<Box flexGrow={2}>
								{/* Search Bar */}
								<Input
									width="full"
									placeholder="Search"
									onChange={searchbarOnChange}
									value={searchbarValue}
								/>
								{/* NOTE: Updates may stutter in dev mode but is fine when built */}
							</Box>
							<Box>
								<SimpleGrid columns={[2, 2, 2, 1]} gap="group">
									{/* Reset Filters Button */}
									<Button width="full" onClick={resetFilters}>
										Reset Filters
									</Button>
									{/* Filter Options Dialog Button */}
									<Button
										width="full"
										display={[
											"inline-flex",
											"inline-flex",
											"inline-flex",
											"none",
										]}
										onClick={() => openDialog("filter")}
									>
										Filters
									</Button>
								</SimpleGrid>
							</Box>
						</Stack>
						<InventorySheetTable
							onRowClick={(item) => openDialog("item.edit", item)}
							marginBottom="break"
						/>
						<Flex width="full">
							<Center flexGrow={1}>
								<Divider />
							</Center>
							<H3
								fontWeight="300"
								flexShrink={1}
								textAlign="center"
								display="inline"
								paddingX="break"
							>
								Party Member Totals
							</H3>
							<Center flexGrow={1}>
								<Divider />
							</Center>
						</Flex>
						<MemberCarryWeightTable />
						{/* Dialogs */}
						<ItemDialog mode="new" />
						<ItemDialog mode="edit" />
						<FilterDialog />
						<SheetOptionsDialog />
						<WelcomeDialog />
					</main>
				</Box>
			</SheetStateProvider>
		</>
	);
};

/**
 * Get the props rendered by the server
 *
 * @param {object} context Path context data
 * @param {object} context.params Path url parameters
 * @param {string | string[]} context.params.sheetId The sheet id in the ur;
 * @returns {GetStaticPropsResult<InventorySheetFields>} The props for the sheet
 */
export const getServerSideProps: GetServerSideProps<InventorySheetFields> = async (
	context
) => {
	const sheetData = await fetchSheetFromDb(getUrlParam(context.params.sheetId));
	return {
		props: { ...sheetData, isNew: typeof context.query.new !== "undefined" },
	};
};

export default Sheet;
