import { Predicate } from '@angular/core';
import { RetroMessage, MessageType, MessageSubtype, RetroConfig } from '@app/retro/retro-state.class';
import * as _ from 'lodash';

export interface LaneDefinition {
	name: string;
	inputLabel: string;
	messagePlaceholder: string;
	filters: LaneFilter[];
	type: MessageType;
	subType?: MessageSubtype;
}

export enum LaneDefinitionType {
	START = 'START',
	STOP = 'STOP',
	CONTINUE = 'CONTINUE',
	GOOD = 'GOOD',
	IMPROVE = 'IMPROVE',
	SLOWDOWNS = 'SLOWDOWNS',
	ACHIEVEMENTS = 'ACHIEVEMENTS',
	ACTION = 'ACTION'
}

export enum LaneFilter {
	GOOD = 'GOOD',
	START = 'START',
	ACHIEVEMENT = 'ACHIEVEMENT',
	BAD = 'BAD',
	SLOWDOWN = 'SLOWDOWN',
	ACTION = 'ACTION'
}


export class LaneDefinitions {
	private static definitions: {[key in keyof typeof LaneDefinitionType]: Omit<LaneDefinition, 'filters'>} = {
		START: {
			name: 'Start doing',
			inputLabel: 'Start doing',
			messagePlaceholder: `Activities that may:
 - improve processes
 - reduce waste
 - have a positive impact on the way the team operates`,
			type: MessageType.evil,
			subType: MessageSubtype.start,
		},
		STOP: {
			name: 'Stop doing',
			inputLabel: 'Stop doing',
			messagePlaceholder: `Activities that:
 - are inefficient
 - waste time or resources
 - have a negative impact on the way people feel or the way things work`,
			type: MessageType.evil,
		},
		CONTINUE: {
			name: 'Continue doing',
			inputLabel: 'Continue doing',
			messagePlaceholder: `Activities the team has tried and were successful but are not yet part of common practice.
Once the activities are part of the way things are done, add them to procedure manuals and checklists and remove from this list.`,
			type: MessageType.good,
		},
		GOOD: {
			name: 'What went well',
			inputLabel: 'What went well?',
			messagePlaceholder: `What were you pleased with?
What produced good outcomes?
What tools and techniques worked well?
What things should we continue to do?
Any praise or thanks you want to give to team members?`,
			type: MessageType.good,
		},
		IMPROVE: {
			name: 'What can be improved',
			inputLabel: 'What could’ve gone better?',
			messagePlaceholder: `What went wrong?
What is not delivering value?
What areas do you see for improvement?
What didn’t go as expected?`,
			type: MessageType.evil,
		},
		SLOWDOWNS: {
			name: 'What slows me down',
			inputLabel: 'What slows me down',
			messagePlaceholder: `Identify aspects of the project that slowed you down.`,
			type: MessageType.evil,
			subType: MessageSubtype.slowdown,
		},
		ACHIEVEMENTS: {
			name: 'Team achievements',
			inputLabel: 'Team achievements',
			messagePlaceholder: `Call out significant events: releases, victories, discoveries, moments of great teamwork, or anything else that had an impact on your work`,
			type: MessageType.good,
			subType: MessageSubtype.achievement,
		},
		ACTION: {
			name: 'Action items',
			inputLabel: 'Action items',
			messagePlaceholder: 'Add new action item or create one from any previous item',
			type: MessageType.action,
		},
	};

	private static getLaneFilters(type: LaneDefinitionType, config: RetroConfig): LaneFilter[] {
		switch (type) {
			case LaneDefinitionType.START: return [LaneFilter.START];
			case LaneDefinitionType.STOP: return [LaneFilter.BAD].concat(config.slowdowns ? [] : [LaneFilter.SLOWDOWN]);
			case LaneDefinitionType.CONTINUE: return [LaneFilter.GOOD].concat(config.achievements ? [] : [LaneFilter.ACHIEVEMENT]);
			case LaneDefinitionType.GOOD: return [LaneFilter.GOOD].concat(config.achievements ? [] : [LaneFilter.ACHIEVEMENT]);
			case LaneDefinitionType.IMPROVE: return [LaneFilter.BAD, LaneFilter.START].concat(config.slowdowns ? [] : [LaneFilter.SLOWDOWN]);
			case LaneDefinitionType.SLOWDOWNS: return [LaneFilter.SLOWDOWN];
			case LaneDefinitionType.ACHIEVEMENTS: return [LaneFilter.ACHIEVEMENT];
			case LaneDefinitionType.ACTION: return [LaneFilter.ACTION]; 
		}
	}

	private static getFilter(type: LaneDefinitionType, config: RetroConfig): {filters: LaneFilter[]} {
		return {filters: LaneDefinitions.getLaneFilters(type, config)};
	}

	static getDefinition(type: LaneDefinitionType, config: RetroConfig): LaneDefinition {
		return _.extend({}, LaneDefinitions.definitions[type], LaneDefinitions.getFilter(type, config));
	}
}

export class LanePredicates {
	private static mapping: {[key in keyof typeof LaneFilter]: [MessageType, MessageSubtype]} = {
		GOOD: [MessageType.good, null],
		START: [MessageType.evil, MessageSubtype.start],
		ACHIEVEMENT: [MessageType.good, MessageSubtype.achievement],
		BAD: [MessageType.evil, null],
		SLOWDOWN: [MessageType.evil, MessageSubtype.slowdown],
		ACTION: [MessageType.action, null],
	};

	static matchFilters(message: RetroMessage, filters: LaneFilter[]): boolean {
		return _.some(filters, filter => {
			let typeDef = this.mapping[filter];
			return this.matches(message.type, typeDef[0]) && this.matches(message.subtype, typeDef[1]);
		});
	}

	private static matches<T>(value1: T, value2: T): boolean {
		return value1 === value2 || (!value1 && !value2);
	} 
}
