import _ from 'lodash';
import React from 'react';
import { lucidClassNames } from '../../util/style-helpers';
import { createClass, filterTypes, findTypes, omitProps } from '../../util/component-types';
import * as reducers from './Sidebar.reducers';
import SplitVertical from '../SplitVertical/SplitVertical';
import ChevronIcon  from '../Icon/ChevronIcon/ChevronIcon';
import GripperVerticalIcon  from '../Icon/GripperVerticalIcon/GripperVerticalIcon';

const cx = lucidClassNames.bind('&-Sidebar');

const {
	any,
	bool,
	func,
	node,
	number,
	string,
	oneOf,
	oneOfType,
} = React.PropTypes;

/**
 * {"categories": ["layout"]}
 *
 * `Sidebar` renders a collapsible, resizeable side bar panel next to primary content.
 */
const Sidebar = createClass({
	displayName: 'Sidebar',

	reducers,

	propTypes: {
		/**
		 * Appended to the component-specific class names set on the root
		 * element. Value is run through the `classnames` library.
		 */
		className: string,
		/**
		 * Direct children must be types {Sidebar.Primary, Sidebar.Bar, Sidebar.Title}.
		 * All content is composed as children of these respective elements.
		 */
		children: node,
		/**
		 * Sets the starting width of the Bar.
		 */
		width: oneOfType([number, string]),
		/**
		 * Force the Sidebar to be expanded or collapsed.
		 */
		isExpanded: bool,
		/**
		 * Allows animated expand and collapse behavior.
		 */
		isAnimated: bool,
		/**
		 * Render the Sidebar to the left or right of primary content.
		 */
		position: oneOf(['left', 'right']),
		/**
		 * Disable user resizing of the Sidebar.
		 */
		isResizeDisabled: bool,
		/**
		 * Set the title of the Sidebar. (alias for `Title` and `Sidebar.Title`)
		 */
		title: any,
		/**
		 * Set the title of the Sidebar. (alias for `title` and `Sidebar.Title`)
		 */
		Title: any,
		/**
		 * Called when the user resizes the Sidebar.
		 *
		 * Signature: `(width, { event, props }) => {}`
		 */
		onResize: func,
		/**
		 * Called when the user expands or collapses the Sidebar.
		 *
		 * Signature: `({ event, props }) => {}`
		 */
		onToggle: func,
	},

	components: {
		Bar: createClass({
			displayName: 'Sidebar.Bar',
			propTypes: {
				/**
				 * Sidebar content. Also can define <Sidebar.Title> here as well.
				 */
				children: node,
				/**
				 * Set the title of the Sidebar. (alias for `Title` and `Sidebar.Title`)
				 */
				title: any,
				/**
				 * Set the title of the Sidebar. (alias for `title` and `Sidebar.Title`)
				 */
				Title: any,
			},
		}),

		Primary: createClass({
			displayName: 'SplitVertical.Primary',
			propTypes: {
				/**
				 * Primary content rendered beside the Sidebar.
				 */
				children: node,
			},
		}),

		Title: createClass({
			displayName: 'Sidebar.Title',
			propName: ['Title', 'title'],
			propTypes: {
				/**
				 * Sidebar title.
				 */
				children: node,
			},
		}),

	},

	getDefaultProps() {
		return {
			isExpanded: true,
			isAnimated: true,
			width: 250,
			position: 'left',
			isResizeDisabled: false,
			onResize: _.noop,
			onToggle: _.noop,
		};
	},

	handleExpanderClick(event) {
		const {
			onToggle,
		} = this.props;

		onToggle({ props: this.props, event });
	},

	handleResize(width, { event }) {
		const {
			onResize,
		} = this.props;

		onResize(width, { props: this.props, event });
	},

	render() {
		const {
			children,
			className,
			isExpanded,
			isAnimated,
			position,
			isResizeDisabled,
			width,
			...passThroughs,
		} = this.props;

		const primaryProps = _.get(_.first(filterTypes(children, Sidebar.Primary)), 'props', {}); // props from first Primary
		const barProps = _.get(_.first(filterTypes(children, Sidebar.Bar)), 'props', {}); // props from first Bar
		const titleProps = _.get(
			findTypes(barProps, Sidebar.Title).concat(findTypes(this.props, Sidebar.Title)), // get titles from Bar and parent Sidebar
			'[0].props', // select props from the first title element
			(<Sidebar.Title>Title</Sidebar.Title>).props // default props
		);

		let PrimaryPane, BarPane; // using Left/Right Pane as primary depends on position
		if (position !== 'right') {
			PrimaryPane = SplitVertical.RightPane;
			BarPane = SplitVertical.LeftPane;
		} else {
			PrimaryPane = SplitVertical.LeftPane;
			BarPane = SplitVertical.RightPane;
		}

		return (
			<SplitVertical
				{...omitProps(passThroughs, Sidebar)}
				className={cx('&', {
					'&-is-resize-disabled': isResizeDisabled,
					'&-is-position-right': position === 'right',
					'&-is-position-left': position !== 'right',
				}, className)}
				isAnimated={isAnimated}
				isExpanded={isExpanded}
				collapseShift={33} // leave 33px of sidebar to stick out when collapsed
				onResize={this.handleResize}
			>
				<BarPane {...omitProps(barProps, Sidebar.Bar)} className={cx('&-Bar', barProps.className)} width={width}>
					<div className={cx('&-Bar-overlay')} />
					<div className={cx('&-Bar-header')}>
						<div {...titleProps} className={cx('&-Bar-Title', titleProps.className)} />
						<div className={cx('&-expander')} onMouseDown={this.handleExpanderClick}>
							<ChevronIcon direction={isExpanded && position === 'right' || !isExpanded && position !== 'right' ? 'right' : 'left'} />
						</div>
					</div>
					<div className={cx('&-Bar-content')}>
						{barProps.children}
					</div>
				</BarPane>
				<SplitVertical.Divider className={cx('&-Divider')}>
					<GripperVerticalIcon className={cx('&-Divider-gripper')} />
				</SplitVertical.Divider>
				<PrimaryPane {...primaryProps} className={cx('&-Primary', primaryProps.className)} isPrimary />
			</SplitVertical>
		);
	},
});

export default Sidebar;