/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * @flow
 */

import React from 'react';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import {
  DialogActions,
  DialogContent,
  DialogTitle,
} from 'material-ui/Dialog';
import moment from 'moment';
import Tabs, { Tab } from 'material-ui/Tabs';
import Typography from 'material-ui/Typography';
import Datetime from 'react-datetime';
import { withStyles } from 'material-ui/styles/index';
import { FormControl, FormHelperText } from 'material-ui/Form';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import i18n from '../../services/i18n';
import { type Tag } from '../../reducers/taglibrary';
import { convertToDateTime, convertToDateRange, parseDate, parseToDate, convertToDate, splitValue } from '../../utils/dates';

const styles = theme => ({
  root: {
    width: 550,
    height: '100%',
    overflowY: 'overlay',
    marginBottom: 30,
    // background: theme.palette.background.paper
  },
  fab: {
    position: 'absolute',
    // bottom: theme.spacing.unit * 2,
    // right: theme.spacing.unit * 2,
  },
  fabGreen: {
    // color: theme.palette.common.white
  },
  dateCalendar: {
    paddingLeft: '24%'
  },
  overflowScrollHidden: {
    overflowX: 'hidden'
  },
  dateRange: {
    display: 'flex'
  },
  fromDateTimeHelpText: {
    marginLeft: '22%',
  },
  toDateTimeHelpText: {
    marginLeft: '46%',
  }
});

type Props = {
  onClose: () => void,
  editTagForEntry: () => void,
  currentEntryPath: string,
  selectedTag: Tag,
  open: boolean,
  selectedFilePath: string
};

type State = {
  errorTag?: string,
  disableConfirmButton?: boolean,
  tag?: string,
  format?: string,
  viewMode?: string
};

function TabContainer(props) {
  const { children, dir } = props;

  return (
    <Typography component="div" dir={dir} style={{ padding: 5 }}>
      {children}
    </Typography>
  );
}

const cn = location.search.indexOf('cn') !== -1;

if (cn) {
  moment.locale('zh-cn');
} else {
  moment.locale('en-gb');
}

const now = moment();
if (cn) {
  now.utcOffset(8);
} else {
  now.utcOffset(0);
}

const defaultCalendarValue = now.clone();
defaultCalendarValue.add(-1, 'month');

class DateCalendarDialog extends React.Component<Props, State> {
  state = {
    disableConfirmButton: true,
    errorTag: true,
    title: '',
    value: 0,
    dateCalendar: new Date(),
    dateTimeCalendar: new Date(),
    fromDateRangeCalendar: new Date(),
    toDateRangeCalendar: new Date(),
  };

  componentWillReceiveProps = (nextProps: any) => {
    if (nextProps.open === true) {
      this.setState({
        convertToDateTime: convertToDateTime(nextProps.selectedTag.title),
        title: nextProps.selectedTag.title
      });
      this.tagRecognition(nextProps.selectedTag.title, convertToDateTime(nextProps.selectedTag.title));
    }
  };

  handleInputChange = (event: Object) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    }, this.handleValidation);
  };

  handleChangeTabIndex = (event: Object, value) => {
    this.setState({ value });
  };

  onChangeDateCalendar = (event: Object) => {
    console.log(parseDate(event._d));
    this.setState({ title: parseDate(event._d) });
  };

  onChangeDateTime = (event) => {
    let currentDate;
    const d = event._d;
    const getHours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
    const getMinutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();

    const time = getHours + '' + getMinutes + '00';
    currentDate = parseDate(d);
    const dateDivider = '~';
    currentDate = currentDate + dateDivider + time;
    this.setState({ title: currentDate });
  };

  onChangeFromDateRange = (event: Object) => {
    const currentMinDate = parseDate(event._d);
    let oldValue = this.state.title;
    if (oldValue.includes(oldValue)) {
      oldValue = oldValue.split('-');
      oldValue = oldValue[1];
    }
    this.setState({ title: currentMinDate + '-' + oldValue });
  };

  onChangeToDateRange = (event: Object) => {
    const currentMaxDate = parseDate(event._d);
    let oldValue = this.state.title;
    if (oldValue.includes(oldValue)) {
      oldValue = oldValue.split('-');
      oldValue = oldValue[0];
    }
    this.setState({ title: oldValue + '-' + currentMaxDate });
  };

  showDateCalendarTag = (currentDateTime) => {
    const defaultDateCalendar = parseToDate(currentDateTime);
    if (defaultDateCalendar.toString().length === 7 || defaultDateCalendar.length === 7) {
      this.setState({
        viewMode: 'months',
        format: 'YYYY/MM'
      });
    } else if (defaultDateCalendar.toString().length === 4) {
      this.setState({
        viewMode: 'years',
        format: 'YYYY'
      });
    } else if (defaultDateCalendar.toString().length === 10) {
      this.setState({
        viewMode: 'days',
        format: 'YYYY/MM/DD'
      });
    } else {
      this.setState({
        viewMode: 'days',
        format: 'YYYY/MM/DD'
      });
    }
    this.setState({
      value: 0,
      defaultDate: defaultDateCalendar,
      title: currentDateTime
    });
  };

  showDateTimeCalendar = (currentDateTime) => {
    const defaultDate = convertToDateTime(currentDateTime);
    let currentDate;
    let dateDivider;

    const d = new Date(defaultDate);
    const getHours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
    const getMinutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
    // const getSeconds = d.getSeconds();
    const time = getHours + '' + getMinutes + '00';
    const dateTag = this.state.title; // selectedTag;
    currentDate = parseDate(d);

    if (dateTag.length !== 5) {
      if (dateTag.indexOf('~') !== -1) {
        dateDivider = '~';
        currentDate = currentDate + dateDivider + time;
      }
      if (dateTag.indexOf(':') !== -1 && dateTag.length !== 5) {
        dateDivider = ':';
        currentDate = currentDate + dateDivider + time;
      }
      if (dateTag.indexOf('!') !== -1 && dateTag.length !== 5) {
        dateDivider = '!';
        currentDate = currentDate + dateDivider + time;
      }
    } else {
      if (dateTag.indexOf('~')) {
        dateDivider = '~';
        currentDate = getHours + dateDivider + getMinutes;
      }
      if (dateTag.indexOf(':')) {
        dateDivider = ':';
        currentDate = getHours + dateDivider + getMinutes;
      }
      if (dateTag.indexOf('!')) {
        dateDivider = '!';
        currentDate = getHours + dateDivider + getMinutes;
      }
    }

    this.setState({
      defaultDate,
      value: 1,
      title: currentDate,
      format: 'YYYY-MM-DD HH:mm:ss'
    });
  };

  showDateRangeCalendar = (currentDateTime) => {
    const range = convertToDateRange(currentDateTime);
    if ((range[0].toString().length === 6 || range[0].length === 6) && (range[1].toString().length === 6 || range[1].length === 6)) {
      this.setState({
        viewMode: 'years',
        format: 'YYYY-MM'
      });
    } else if (range[0].toString().length === 4 && range[1].toString().length === 4) {
      this.setState({
        viewMode: 'years',
        format: 'YYYY'
      });
    } else {
      this.setState({
        viewMode: 'days',
        format: 'YYYY-MM-DD'
      });
    }

    this.setState({
      value: 2,
      fromDateRangeCalendar: convertToDate(range[0]),
      toDateRangeCalendar: convertToDate(range[1])
    });
  };

  tagRecognition = (dataTag, toDateTime) => {
    const geoLocationRegExp = /^([-+]?)([\d]{1,2})(((\.)(\d+)(,)))(\s*)(([-+]?)([\d]{1,3})((\.)(\d+))?)$/g;
    const dateTimeRegExp = /^\d\d\d\d-(00|[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9])$/g;
    const dateTimeWinRegExp = /^(([0-1]?[0-9])|([2][0-3]))!([0-5]?[0-9])(!([0-5]?[0-9]))?$/g;
    const dateRangeRegExp = /^([0]?[1-9]|[1|2][0-9]|[3][0|1])[-]([0]?[1-9]|[1][0-2])$/g;
    const geoTag = 'geo-tag';
    let currentCoordinate;
    const currentDateTime = dataTag;

    const year = parseInt(currentDateTime, 10) && !isNaN(currentDateTime) &&
      currentDateTime.length === 4;
    const month = parseInt(currentDateTime, 10) && !isNaN(currentDateTime) &&
      currentDateTime.length === 6;
    const date = parseInt(currentDateTime, 10) && !isNaN(currentDateTime) &&
      currentDateTime.length === 8;

    // const convertToDateTime = this.state.convertToDateTime; // convertToDateTime(currentDateTime);
    let yearRange;
    let monthRange;
    let dateRange;

    if (dataTag.lastIndexOf('+') !== -1) {
      currentCoordinate = splitValue(dataTag, dataTag.lastIndexOf('+'));
    } else if (dataTag.lastIndexOf('-') !== -1) {
      currentCoordinate = splitValue(dataTag, dataTag.lastIndexOf('-'));

      const character = currentDateTime.split('-');
      if (!currentCoordinate.search('.') && character) {
        const firstInt = parseInt(character[0], 10);
        const secondInt = parseInt(character[1], 10);
        yearRange = monthRange = dateRange =
          typeof firstInt === 'number' && !isNaN(firstInt) &&
          typeof secondInt === 'number' && !isNaN(secondInt);
      }
    }

    const dateRegExp = yearRange || monthRange || dateRange ||
      currentDateTime.match(dateTimeRegExp) ||
      currentDateTime.match(dateTimeWinRegExp) ||
      year || month || date || toDateTime;

    if (geoLocationRegExp.exec(currentCoordinate) || geoTag === dataTag) {
      // if (TSCORE.PRO) {
      // $('.nav-tabs a[href="#geoLocation"]').tab('show');
      // } else {
      // $('.nav-tabs a[href="#plainEditorTab"]').tab('show');
      // }
    } else if (dateRegExp) {
      const dateTab = year || month || date;
      const dateTimeTab = currentDateTime.match(dateTimeRegExp) ||
        currentDateTime.match(dateTimeWinRegExp) || toDateTime;
      const dateRangeTab = currentDateTime.match(dateRangeRegExp) ||
        yearRange || monthRange || dateRange;

      if (dateTab) {
        // Show date calendar
        this.showDateCalendarTag(currentDateTime);
      } else if (dateTimeTab) {
        // Show date time calendar
        this.showDateTimeCalendar(currentDateTime);
      } else if (dateRangeTab) {
        // Show date range calendar
        this.showDateRangeCalendar(currentDateTime);
      }
    } else if (!(dateRegExp && geoLocationRegExp.exec(currentCoordinate))) {
      // Show plain editor tab
      // this.setState({ value: 0 });
    } else {
      throw new TypeError('Invalid data.');
    }
  };

  handleValidation() {
    if (this.state.title.length > 0) {
      this.setState({ inputError: false, disableConfirmButton: false });
    } else {
      this.setState({ inputError: true, disableConfirmButton: true });
    }
  }

  onConfirm = () => {
    if (!this.state.disableConfirmButton) {
      this.props.editTagForEntry(this.props.currentEntryPath, this.props.selectedTag, this.state.title);
      this.setState({ inputError: false, disableConfirmButton: true });
      this.props.onClose();
    }
  };

  renderTitle = () => (
    <DialogTitle>{i18n.t('core:createEditDateTitle')}</DialogTitle>
  );

  renderContent = () => {
    const { value } = this.state;
    const { classes } = this.props;

    return (
      <DialogContent data-tid="dateCalendarDialog" className={this.props.classes.root}>
        <Tabs
          data-tid="dateCalendarDialogTabs"
          name="dateTagTabs"
          value={this.state.value}
          onChange={this.handleChangeTabIndex}
          indicatorColor="primary"
          textColor="primary"
          fullWidth
        >
          <Tab data-tid="dateCalendarTab" label={i18n.t('core:dateCalendarTab')} />
          <Tab data-tid="dateTimeTab" label={i18n.t('core:dateTime')} />
          <Tab data-tid="dateRangeTab" label={i18n.t('core:dateRangeTab')} />
        </Tabs>
        {value === 0 &&
        <TabContainer>
          <Datetime
            data-tid="dateCalendarContainer"
            className={classes.dateCalendar}
            input={false}
            dateFormat={this.state.format}
            name="title"
            onChange={this.onChangeDateCalendar}
            defaultDate={this.state.title}
          />
        </TabContainer>
        }
        {value === 1 &&
        <TabContainer>
          <Datetime
            data-tid="dateTimeCalendarContainer"
            className={classes.dateCalendar}
            input={false}
            dateFormat={this.state.format}
            name="title"
            onChange={this.onChangeDateTime}
            defaultDate={this.state.title}
          />
        </TabContainer>
        }
        {value === 2 &&
        <TabContainer>
          <span className={classes.fromDateTimeHelpText}>{i18n.t('core:fromDateTime')}</span>
          <span className={classes.toDateTimeHelpText}>{i18n.t('core:toDateTime')}</span>
          <div className={classes.dateRange}>
            <Datetime
              data-tid="fromDateRangeCalendarContainer1"
              input={false}
              onChange={this.onChangeFromDateRange}
              dateFormat={this.state.format}
              name="fromDateRangeCalendar"
              viewDate={this.state.fromDateRangeCalendar}
            />
            <Datetime
              data-tid="toDateRangeCalendarContainer"
              input={false}
              name="toDateRangeCalendar"
              onChange={this.onChangeToDateRange}
              dateFormat={this.state.format}
              viewDate={this.state.toDateRangeCalendar}
            />
          </div>
        </TabContainer>
        }
        <FormControl
          fullWidth={true}
          error={this.state.errorTag}
        >
          <TextField
            fullWidth={true}
            error={this.state.errorTag}
            margin="dense"
            name="title"
            label={i18n.t('core:editTag')}
            onChange={this.handleInputChange}
            value={this.state.title}
            data-tid="dateCalendarDialog_inputField"
          />
          {this.state.inputError && <FormHelperText>Can title could not be empty</FormHelperText>}
        </FormControl>
      </DialogContent>
    );
  };

  renderActions = () => (
    <DialogActions>
      <Button
        data-tid="closeDateCalendarDialog"
        onClick={this.props.onClose}
      >
        {i18n.t('core:cancel')}
      </Button>
      <Button
        disabled={this.state.disableConfirmButton}
        onClick={this.onConfirm}
        data-tid="confirmDateCalendarDialog"
        color="primary"
      >
        {i18n.t('core:ok')}
      </Button>
    </DialogActions>
  );

  render() {
    return (
      <GenericDialog
        open={this.props.open}
        onClose={this.props.onClose}
        onEnterKey={(event) => onEnterKeyHandler(event, this.onConfirm)}
        renderTitle={this.renderTitle}
        renderContent={this.renderContent}
        renderActions={this.renderActions}
      />
    );
  }
}

export default withStyles(styles)(DateCalendarDialog);
