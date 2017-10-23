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

const MarkedValue = createClass({
	render() {
		return null;
	}
});

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
		let marker = this.props.option.isSelected ? 'fa fa-check-square-o' : 'fa fa-square-o';
		return(
			<span><i className={marker} aria-hidden="true">&nbsp;</i>&nbsp;</span>
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

	markSelectedOptions (options, filterValue, currentValue) {

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

	toggleSelection (value) {
		// get last item selected
		let lastItem = value[value.length - 1];

		// check if current state value already contain new item
		let foundDuplicate = this.state.value.find(elem => {
			return elem.value === lastItem.value;
		});

		// remove item if it exists
		if (foundDuplicate) {
			value = this.state.value.filter( val => {
				return foundDuplicate.value !== val.value;
			});

			// remove isSelected marker on the option
			this.props.options.map( option => {
				if (foundDuplicate.value === option.value) {
					option.isSelected = false;
				}
				return option;
			});
		}

		if (this.props.onChange) {
			this.props.onChange(value);
		}
		this.setState({ value });
	},

	toggleCheckbox (e) {
		this.setState({
			[e.target.name]: e.target.checked,
		});
	},

	renderClearButton () {
		return null;
	},

	render () {
		const { value } = this.state;
		return (
			<div className="section">
				<h3 className="section-heading">{this.props.label}</h3>
				<Select
					clearRenderer={this.renderClearButton}
					closeOnSelect={false}
					disabled={this.props.disabled}
					multi
					onChange={this.toggleSelection}
					optionComponent={MarkedOption}
					options={this.props.options}
					valueComponent={MarkedValue}
					filterOptions={this.markSelectedOptions}
					placeholder="Select your favourite(s)"
					value={value}
				/>
			</div>
		);
	}
});

MarkedSelectField.propTypes = {
	disabled: PropTypes.bool,
	label: PropTypes.string,
	onChange: PropTypes.func,
	options: PropTypes.array,
};

MarkedSelectField.defaultProps = {
	ignoreAccents: true,
	ignoreCase: true,
	matchPos: 'any',
	matchProp: 'any',
	valueKey: 'value',
	options: [],
	disabled: false,
};


module.exports = MarkedSelectField;
