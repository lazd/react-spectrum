/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionButton} from '@react-spectrum/button';
import {AriaButtonProps} from '@react-types/button';
import {CalendarMonth} from './CalendarMonth';
import {CalendarPropsBase} from '@react-types/calendar';
import {CalendarState, RangeCalendarState} from '@react-stately/calendar';
import ChevronLeft from '@spectrum-icons/ui/ChevronLeftLarge';
import ChevronRight from '@spectrum-icons/ui/ChevronRightLarge';
import {classNames, useStyleProps} from '@react-spectrum/utils';
import {DOMProps, StyleProps} from '@react-types/shared';
import {HelpText} from '@react-spectrum/label';
// @ts-ignore
import intlMessages from '../intl/*.json';
import React, {HTMLAttributes, RefObject} from 'react';
import styles from '@adobe/spectrum-css-temp/components/calendar/vars.css';
import {useDateFormatter, useLocale, useMessageFormatter} from '@react-aria/i18n';

interface CalendarBaseProps<T extends CalendarState | RangeCalendarState> extends CalendarPropsBase, DOMProps, StyleProps {
  state: T,
  visibleMonths?: number,
  calendarProps: HTMLAttributes<HTMLElement>,
  nextButtonProps: AriaButtonProps,
  prevButtonProps: AriaButtonProps,
  errorMessageProps: HTMLAttributes<HTMLElement>,
  calendarRef: RefObject<HTMLDivElement>
}

export function CalendarBase<T extends CalendarState | RangeCalendarState>(props: CalendarBaseProps<T>) {
  let {
    state,
    calendarProps,
    nextButtonProps,
    prevButtonProps,
    errorMessageProps,
    calendarRef: ref,
    visibleMonths = 1
  } = props;
  let {styleProps} = useStyleProps(props);
  let formatMessage = useMessageFormatter(intlMessages);
  let {direction} = useLocale();
  let currentMonth = state.visibleRange.start;
  let monthDateFormatter = useDateFormatter({
    month: 'long',
    year: 'numeric',
    era: currentMonth.calendar.identifier !== 'gregory' ? 'long' : undefined,
    calendar: currentMonth.calendar.identifier,
    timeZone: state.timeZone
  });

  let titles = [];
  let calendars = [];
  for (let i = 0; i < visibleMonths; i++) {
    titles.push(
      <div key={i} className={classNames(styles, 'spectrum-Calendar-monthHeader')}>
        {i === 0 &&
          <ActionButton
            {...prevButtonProps}
            UNSAFE_className={classNames(styles, 'spectrum-Calendar-prevMonth')}
            isQuiet>
            {direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
          </ActionButton>
        }
        <h2
          className={classNames(styles, 'spectrum-Calendar-title')}>
          {monthDateFormatter.format(currentMonth.add({months: i}).toDate(state.timeZone))}
        </h2>
        {i === visibleMonths - 1 &&
          <ActionButton
            {...nextButtonProps}
            UNSAFE_className={classNames(styles, 'spectrum-Calendar-nextMonth')}
            isQuiet>
            {direction === 'rtl' ? <ChevronLeft /> : <ChevronRight />}
          </ActionButton>
        }
      </div>
    );

    let d = currentMonth.add({months: i});
    calendars.push(
      <CalendarMonth
        {...props}
        key={`${d.year}-${d.month}-${d.day}`}
        state={state}
        startDate={d} />
    );
  }

  return (
    <div
      {...styleProps}
      {...calendarProps}
      ref={ref}
      className={
        classNames(styles,
          'spectrum-Calendar',
          styleProps.className
        )
      }>
      <div className={classNames(styles, 'spectrum-Calendar-header')}>
        {titles}
      </div>
      <div className={classNames(styles, 'spectrum-Calendar-months')}>
        {calendars}
      </div>
      {state.validationState === 'invalid' &&
        <HelpText
          showErrorIcon
          errorMessage={props.errorMessage || formatMessage('invalidSelection', {selectedCount: 'highlightedRange' in state ? 2 : 1})}
          errorMessageProps={errorMessageProps}
          validationState="invalid"
          // Intentionally a global class name so it can be targeted in DatePicker CSS...
          UNSAFE_className="spectrum-Calendar-helpText" />
      }
    </div>
  );
}
