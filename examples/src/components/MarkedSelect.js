/**
 * Copyright (c) 2017 The Hyve B.V.
 * This code is licensed under the GNU General Public License,
 * version 3, or (at your option) any later version.
 */

import React from 'react';
import createClass from 'create-react-class';
import PropTypes from 'prop-types';
import Select from 'react-select';
import stripDiacritics from './stripDiacritics';

const FLAVOURS = [
	{ label: 'Chocolate', value: 'chocolate' },
	{ label: 'Vanilla', value: 'vanilla' },
	{ label: 'Strawberry', value: 'strawberry' },
	{ label: 'Caramel', value: 'caramel' },
	{ label: 'Cookies and Cream', value: 'cookiescream' },
	{ label: 'Peppermint', value: 'peppermint' },
];

const WHY_WOULD_YOU = [
	{ label: 'Chocolate (are you crazy?)', value: 'chocolate', disabled: true },
].concat(FLAVOURS.slice(1));

const MarkedOption = createClass({
	propTypes: {
		children: PropTypes.node,
		className: PropTypes.string,
		ignoreAccents: PropTypes.bool,
		ignoreCase: PropTypes.bool,
		isDisabled: PropTypes.bool,
		isFocused: PropTypes.bool,
		isSelected: PropTypes.bool,
		matchPos: PropTypes.string,
		matchProp: PropTypes.string,
		onFocus: PropTypes.func,
		onSelect: PropTypes.func,
		option: PropTypes.object.isRequired,
		valueKey: PropTypes.string,
	},
	handleMouseDown (event) {
		event.preventDefault();
		event.stopPropagation();
		this.props.onSelect(this.props.option, event);
	},
	handleMouseEnter (event) {
		this.props.onFocus(this.props.option, event);
	},
	handleMouseMove (event) {
		if (this.props.isFocused) return;
		this.props.onFocus(this.props.option, event);
	},
	renderMarker () {
		let marker = '';
		if (this.props.option.isSelected) {
			marker = 'x';
		}
		return(
			<span>{marker}&nbsp;</span>
		);
	},
	render () {
		return (
			<div className={this.props.className}
				 onMouseDown={this.handleMouseDown}
				 onMouseEnter={this.handleMouseEnter}
				 onMouseMove={this.handleMouseMove}
				 title={this.props.option.title}>
				{this.renderMarker()}
				{this.props.children}
			</div>
		);
	}
});

const MarkedSelectField = createClass({
	displayName: 'MultiSelectField',
	propTypes: {
		label: PropTypes.string,
	},

	markSelectedOptions (options, filterValue, currentValue) {

		// console.log('markSelectedOptions', [options, filterValue, currentValue]);

		if (this.props.ignoreAccents) {
			filterValue = stripDiacritics(filterValue);
		}

		if (this.props.ignoreCase) {
			filterValue = filterValue.toLowerCase();
		}

		if (currentValue) currentValue = currentValue.map(i => i[this.props.valueKey]);

		return options.filter(option => {
			if (currentValue && currentValue.indexOf(option[this.props.valueKey]) > -1) {
				option.isSelected = true;
			}

			if (!filterValue) return true;
			let valueTest = String(option[this.props.valueKey]);
			let labelTest = String(option[this.props.labelKey]);
			if (this.props.ignoreAccents) {
				if (this.props.matchProp !== 'label') valueTest = stripDiacritics(valueTest);
				if (this.props.matchProp !== 'value') labelTest = stripDiacritics(labelTest);
			}
			if (this.props.ignoreCase) {
				if (this.props.matchProp !== 'label') valueTest = valueTest.toLowerCase();
				if (this.props.matchProp !== 'value') labelTest = labelTest.toLowerCase();
			}
			return this.props.matchPos === 'start' ? (
				(this.props.matchProp !== 'label' && valueTest.substr(0, filterValue.length) === filterValue) ||
				(this.props.matchProp !== 'value' && labelTest.substr(0, filterValue.length) === filterValue)
			) : (
				(this.props.matchProp !== 'la	bel' && valueTest.indexOf(filterValue) >= 0) ||
				(this.props.matchProp !== 'value' && labelTest.indexOf(filterValue) >= 0)
			);
		});
	},

	getInitialState () {
		return {
			disabled: false,
			crazy: false,
			stayOpen: false,
			value: [],
		};
	},

	handleSelectChange (newValues) {
		if (newValues.find()) {
			console.log(value + ' already existitng');
		} else {
			this.setState({ value });
		}

	},
	toggleCheckbox (e) {
		this.setState({
			[e.target.name]: e.target.checked,
		});
	},
	render () {
		const { crazy, disabled, stayOpen, value } = this.state;
		const options = crazy ? WHY_WOULD_YOU : FLAVOURS;
		return (
			<div className="section">
				<h3 className="section-heading">{this.props.label}</h3>
				<Select
					closeOnSelect={false}
					disabled={disabled}
					multi
					onChange={this.handleSelectChange}
					optionComponent={MarkedOption}
					options={options}
					markedSelected
					filterOptions={this.markSelectedOptions}
					placeholder="Select your favourite(s)"
					value={value}
				/>

				<div className="checkbox-list">
					<label className="checkbox">
						<input type="checkbox" className="checkbox-control" name="disabled" checked={disabled} onChange={this.toggleCheckbox} />
						<span className="checkbox-label">Disable the control</span>
					</label>
					<label className="checkbox">
						<input type="checkbox" className="checkbox-control" name="crazy" checked={crazy} onChange={this.toggleCheckbox} />
						<span className="checkbox-label">I don't like Chocolate (disabled the option)</span>
					</label>
				</div>
			</div>
		);
	}
});

MarkedSelectField.defaultProps = {
	ignoreAccents: true,
	ignoreCase: true,
	matchPos: 'any',
	matchProp: 'any',
	valueKey: 'value',
};


module.exports = MarkedSelectField;
