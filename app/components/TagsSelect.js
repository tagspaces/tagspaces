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
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import CloseIcon from '@material-ui/icons/Close';
import MenuItem from '@material-ui/core/MenuItem';
import CreatableSelect from 'react-select/lib/Creatable';
import NoSsr from '@material-ui/core/NoSsr';
import TextField from '@material-ui/core/TextField';
import i18n from '../services/i18n';
import { type Tag, getAllTags } from '../reducers/taglibrary';
import { getTagColor, getTagTextColor } from '../reducers/settings';
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
    zIndex: 2,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
  },
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
      tag={props.data}
      tagMode={'remove'}
      deleteIcon={<CloseIcon {...props.removeProps} />}
    />
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
  tags: Array<tag>,
  tagSearchType: string,
  handleChange: () => void,
  allTags: Array<Tag>
};

class TagsSelect extends React.Component<Props> {
  handleChange = (newValue: any, actionMeta: any) => {
    // console.group('Value Changed');
    // console.log(JSON.stringify(newValue));
    // console.log(`action: ${actionMeta.action}`);
    // console.groupEnd();

    if (actionMeta.action === 'select-option') {
      this.props.handleChange(this.props.tagSearchType, newValue, actionMeta.action);
    } else if (actionMeta.action === 'create-option') {
      this.props.allTags.push(newValue);
      this.props.handleChange(this.props.tagSearchType, newValue, actionMeta.action);
    } else if (actionMeta.action === 'remove-value') {
      this.props.handleChange(this.props.tagSearchType, newValue, actionMeta.action);
    } else if (actionMeta.action === 'clear') {
      this.props.handleChange(this.props.tagSearchType, [], actionMeta.action);
    }
  };

  /**
   * temp fix for https://github.com/JedWatson/react-select/issues/2630
   */
  isValidNewOption = (inputValue, selectValue, selectOptions) => !(inputValue.trim().length === 0 ||
      selectOptions.find(option => option.name === inputValue));

  render() {
    const {
      classes,
      theme,
      allTags,
      tags,
      defaultBackgroundColor,
      defaultTextColor
    } = this.props;

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
              color: defaultBackgroundColor,
              textcolor: defaultTextColor
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
            value={tags}
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
  defaultBackgroundColor: getTagColor(state),
  defaultTextColor: getTagTextColor(state)
});


export default connect(mapStateToProps)(withStyles(styles, { withTheme: true })(TagsSelect));
