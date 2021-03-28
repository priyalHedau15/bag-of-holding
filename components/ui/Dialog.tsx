import {
	Modal,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	ModalProps,
} from "@chakra-ui/modal";

export interface DialogProps extends ModalProps {
	header?: React.ReactChildren;
	noOverlay?: boolean;
	noCloseButton?: boolean;
}

/**
 * Component for easily composing Dialogs by making use of the
 * 'Modal' component
 *
 * @param {object} props The props
 * @param {React.ReactChildren} [props.header] The element to use
 * as the header
 * @param {boolean} [props.noOverlay=false] If true, a
 * 'ModalOverlay' is not used
 * @param {boolean} [props.noCloseButton=false] If true, no
 * 'ModalCloseButton' is included
 * @param {React.ReactChildren} [props.children] The children
 * @returns {React.ReactElement} The component stuff
 */
const Dialog: React.FC<DialogProps> = ({
	header,
	noOverlay = false,
	noCloseButton = false,
	children,
	...props
}) => (
	<Modal {...props}>
		{!noOverlay && <ModalOverlay />}
		<ModalContent>
			{header && <ModalHeader>{header}</ModalHeader>}
			{!noCloseButton && <ModalCloseButton />}
			{children}
		</ModalContent>
	</Modal>
);

export default Dialog;