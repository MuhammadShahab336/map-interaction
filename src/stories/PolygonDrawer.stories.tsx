import React from 'react';
import {StoryFn, Meta } from '@storybook/react';
import PolygonDrawer from '../components/PolygonDrawer';

export default {
    title: 'Map/PolygonDrawer',
    component: PolygonDrawer,
} as Meta;

const Template: StoryFn = (args) => <PolygonDrawer {...args} />;

export const Default = Template.bind({});