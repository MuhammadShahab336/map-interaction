import React from 'react';
import {StoryFn, Meta } from '@storybook/react';
import MapComponent from '../components/MapComponent';

export default {
    title: 'Map/MapComponent',
    component: MapComponent,
} as Meta;

const Template: StoryFn = (args) => <MapComponent {...args} />;

export const Default = Template.bind({});