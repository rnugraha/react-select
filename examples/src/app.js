/* eslint react/prop-types: 0 */

import React from 'react';
import ReactDOM from 'react-dom';
import './example.less';

import Creatable from './components/Creatable';
import Contributors from './components/Contributors';
import GithubUsers from './components/GithubUsers';
import CustomComponents from './components/CustomComponents';
import CustomRender from './components/CustomRender';
import Multiselect from './components/Multiselect';
import NumericSelect from './components/NumericSelect';
import BooleanSelect from './components/BooleanSelect';
import Virtualized from './components/Virtualized';
import States from './components/States';
import MarkedSelect from './components/MarkedSelect';

const FLAVOURS = [
	{ label: 'Chocolate', value: 'chocolate' },
	{ label: 'Vanilla', value: 'vanilla' },
	{ label: 'Strawberry', value: 'strawberry' },
	{ label: 'Caramel', value: 'caramel' },
	{ label: 'Cookies and Cream', value: 'cookiescream' },
	{ label: 'Peppermint', value: 'peppermint' },
	{ label: 'Coconut', value: 'coconut', disabled: true },
];

function logChange(val) {
	console.log('Selected: ' + JSON.stringify(val));
}

ReactDOM.render(
	<div>
		<MarkedSelect label="Marked select" options={FLAVOURS} onChange={logChange}/>
		<States label="States" searchable />
		<Multiselect label="Multiselect" />
		<Virtualized label="Virtualized" />
		<Contributors label="Contributors (Async)" />
		<GithubUsers label="Github users (Async with fetch.js)" />
		<NumericSelect label="Numeric Values" />
		<BooleanSelect label="Boolean Values" />
		<CustomRender label="Custom Render Methods"/>
		<CustomComponents label="Custom Placeholder, Option, Value, and Arrow Components" />
		<Creatable
			hint="Enter a value that's NOT in the list, then hit return"
			label="Custom tag creation"
		/>
	</div>,
	document.getElementById('example')
);
