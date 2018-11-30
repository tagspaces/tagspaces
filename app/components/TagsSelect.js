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
import { connect } from 'react-redux';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import CancelIcon from '@material-ui/icons/Cancel';
import CloseIcon from '@material-ui/icons/Close';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import CreatableSelect from 'react-select/lib/Creatable';
import NoSsr from '@material-ui/core/NoSsr';
import TextField from '@material-ui/core/TextField';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import i18n from '../services/i18n';
import { type Tag, getAllTags } from '../reducers/taglibrary';
import TagContainer from './TagContainer';

const styles = theme => ({
  root: {
    flexGrow: 1,
    // height: 250,
    /* '& div': { //https://github.com/JedWatson/react-select/issues/1085
      zIndex: 1
    } */
  },
  input: {
    display: 'flex',
    padding: 0,
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  chip: {
    margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`,
  },
  chipFocused: {
    backgroundColor: emphasize(
      theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
      0.08,
    ),
  },
  noOptionsMessage: {
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  singleValue: {
    fontSize: 16,
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    fontSize: 16,
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
  },
  /* paper: {
    position: 'fixed', // 'absolute',
    marginTop: theme.spacing.unit,
    left: 45,
    right: 0,
    maxWidth: 350,
    zIndex: 1
  }, */
  /* divider: {
    height: theme.spacing.unit * 2,
  }, */
});

function NoOptionsMessage(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.noOptionsMessage}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function inputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />;
}

function Control(props) {
  return (
    <TextField
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          className: props.selectProps.classes.input,
          inputRef: props.innerRef,
          children: props.children,
          ...props.innerProps,
        },
      }}
      {...props.selectProps.textFieldProps}
    />
  );
}

function Option(props) {
  return (
    <MenuItem
      buttonRef={props.innerRef}
      selected={props.isFocused}
      component="div"
      style={{
        fontWeight: props.isSelected ? 500 : 400,
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  );
}

function Placeholder(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.placeholder}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function SingleValue(props) {
  return (
    <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
      {props.children}
    </Typography>
  );
}

function ValueContainer(props) {
  return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}

function MultiValue(props) {
  return (
    <TagContainer
      key={props.data.id || props.data.title}
      defaultTextColor={props.data.textcolor}
      defaultBackgroundColor={props.data.color}
      tag={props.data}
      tagMode={'remove'}
      // tagGroup={tagGroup}
      // handleTagMenu={this.handleTagMenu}
      // addTags={this.props.addTags}
      deleteIcon={<CloseIcon {...props.removeProps} />}
    />
    /* <Chip
      tabIndex={-1}
      label={props.children}
      style={{ fontSize: 16 }}
      className={classNames(props.selectProps.classes.chip, {
        [props.selectProps.classes.chipFocused]: props.isFocused
      })}
      onDelete={props.removeProps.onClick}
      // deleteIcon={<CloseIcon style={{ fill: '#fff' }} {...props.removeProps} />}
      deleteIcon={<CancelIcon {...props.removeProps} />}
    /> */
  );
}

function Menu(props) {
  return (
    <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
      {props.children}
    </Paper>
  );
}

const components = {
  Control,
  Menu,
  MultiValue,
  NoOptionsMessage,
  Option,
  Placeholder,
  SingleValue,
  ValueContainer
};

type Props = {
  classes: Object,
  theme: Object,
  tagQuery: string,
  handleChange: () => void,
  allTags: Array<Tag>
};

class TagsSelect extends React.Component<Props> {
  handleChange = (newValue: any, actionMeta: any) => {
    /* console.group('Value Changed');
    console.log(newValue);
    console.log(`action: ${actionMeta.action}`);
    console.groupEnd(); */

    if (actionMeta.action === 'select-option') {
      this.props.handleChange('tagQuery', newValue, actionMeta.action);
    } else if (actionMeta.action === 'create-option') {
      this.props.allTags.push(newValue);
      this.props.handleChange('tagQuery', newValue, actionMeta.action);
    } else if (actionMeta.action === 'remove-value') {
      this.props.handleChange('tagQuery', newValue, actionMeta.action);
    } else if (actionMeta.action === 'clear') {
      this.props.handleChange('tagQuery', [], actionMeta.action);
    }
  };

  /**
   * temp fix for https://github.com/JedWatson/react-select/issues/2630
   */
  isValidNewOption = (inputValue, selectValue, selectOptions) => !(inputValue.trim().length === 0 ||
      selectOptions.find(option => option.name === inputValue));

  render() {
    const { classes, theme, allTags, tagQuery } = this.props;

    const selectStyles = {
      input: base => ({
        ...base,
        color: theme.palette.text.primary,
        '& input': {
          font: 'inherit',
        },
      }),
    };

    return (
      <div className={classes.root}>
        <NoSsr>
          <CreatableSelect
            isClearable={false}
            classes={classes}
            options={allTags}
            getOptionLabel={(option) => option.title}
            getOptionValue={(option) => option.id || option.title}
            isValidNewOption={this.isValidNewOption}
            getNewOptionData={(inputValue, optionLabel) => ({
              id: inputValue,
              title: optionLabel,
            })}
            styles={selectStyles}
            fullWidth={true}
            components={components}
            /* textFieldProps={{
            label: 'title',
            InputLabelProps: {
              shrink: true,
            },
          }} */
            value={tagQuery}
            onChange={this.handleChange}
            // onInputChange={this.handleInputSelectChange}
            // onCreateOption={this.handleCreate}
            placeholder={i18n.t('core:searchTags')}
            isMulti
            formatCreateLabel={(label) => label}
          // isSearchable
          />
        </NoSsr>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  allTags: getAllTags(state),
});


export default connect(mapStateToProps)(withStyles(styles, { withTheme: true })(TagsSelect));
