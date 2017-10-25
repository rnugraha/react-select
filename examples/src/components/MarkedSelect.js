/**
 * Copyright (c) 2017 The Hyve B.V.
 * This code is licensed under the GNU General Public License,
 * version 3, or (at your option) any later version.
 */

import React from 'react';
import createClass from 'create-react-class';
import PropTypes from 'prop-types';
import Select from 'react-select';
import classNames from 'classnames';
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
				{this.props.option.label}
			</div>
		);
	}
});

const OptionTools = createClass({
	propTypes: {
		onAddAll: PropTypes.func,
		onClearAll: PropTypes.func,
	},

	addAll(event) {
		event.preventDefault();
		event.stopPropagation();
		this.props.onAddAll();
	},

	clearAll(event) {
		event.preventDefault();
		event.stopPropagation();
		this.props.onClearAll();
	},

	render () {
		let optionToolsStyles = {
			fontColor: 'inherit',
			textAlign:'center',
			padding: '1em',
			borderBottom: '1px solid #ccc'
		};
		let toolButtonStyle = {
			borderRadius: '0.3em',
			fontColor: 'inherit',
			backgroundColor: 'white',
			border: '1px solid #ccc',
			padding: '0.5em',
			textAlign: 'center',
			textDecoration: 'none',
			fontSize: 'smaller',
			cursor: 'pointer',
			marginLeft: '0.3em',
		};
		return (
			<div style={optionToolsStyles}>
				<button onClick={this.addAll} style={toolButtonStyle}> Select all</button>
				<button onClick={this.clearAll} style={toolButtonStyle}>Clear</button>
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

		this._visibleOptions = options.filter(option => {

			// mark as selected when options are selected
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
				(this.props.matchProp !== 'label' && valueTest.indexOf(filterValue) >= 0) ||
				(this.props.matchProp !== 'value' && labelTest.indexOf(filterValue) >= 0)
			);
		});
		return this._visibleOptions;
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

	clearIsSelectedFlags() {
		this.props.options.map( option => {
			option.isSelected = false;
			return option;
		});
	},

	getResetValue () {
		if (this.props.resetValue !== undefined) {
			return this.props.resetValue;
		} else if (this.props.multi) {
			return [];
		} else {
			return null;
		}
	},

	setValue (value) {
		if (this.props.autoBlur) {
			this.blurInput();
		}
		if (this.props.required) {
			const required = this.handleRequired(value, this.props.multi);
			this.setState({ required });
		}
		if (this.props.onChange) {
			if (this.props.simpleValue && value) {
				value = this.props.multi ?
					value.map(i => i[this.props.valueKey]).join(this.props.delimiter) : value[this.props.valueKey];
			}
			this.props.onChange(value);
		}
	},

	handleAddAll () {
		this._visibleOptions.forEach( visibleOption => {
			this.props.options.map( option => {
				if ( option.value === visibleOption.value ) {
					option.isSelected = true;
				}
			});
		});
		this.setValue(this._visibleOptions);
		this.setState({ value:this._visibleOptions });
	},

	handleClearAll () {
		this.setValue(this.getResetValue());
		this.clearIsSelectedFlags();
		this.setState({ value:[] });
	},

	renderMenu (params) {
		return params.options.map((option, i) => {
			let isSelected = params.valueArray && params.valueArray.indexOf(option) > -1;
			let isFocused = option === params.focusedOption;
			let optionClass = classNames(params.optionClassName, {
				'Select-option': true,
				'is-selected': isSelected,
				'is-focused': isFocused,
				'is-disabled': option.disabled,
			});
			if (i === 0 ) {
				return (
					<div key={`option-${i}-${option[params.valueKey]}`}>
						<OptionTools
							onAddAll={this.handleAddAll}
							onClearAll={this.handleClearAll}
						/>
						<MarkedOption
							className={optionClass}
							option={option}
							onFocus={params.onFocus}
							onSelect={params.onSelect}
							key={`option-${i}-${option[params.valueKey]}`}
							children={params.children}
						/>
					</div>
				);
			}
			return (
				<div key={`option-${i}-${option[params.valueKey]}`}>
					<MarkedOption
						className={optionClass}
						option={option}
						onFocus={params.onFocus}
						onSelect={params.onSelect}
						children={params.children}
					/>
				</div>
			);
		});
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
					menuRenderer={this.renderMenu}
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
