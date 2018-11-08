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
import Select from 'react-select';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormGroup from '@material-ui/core/FormGroup';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import NoSsr from '@material-ui/core/NoSsr';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
// import styles from './SidePanels.css';
import i18n from '../services/i18n';
import { Pro } from '../pro';

type Props = {
  classes: Object
};

type State = {
  locationName?: string,
  accessKey?: string
};

const styles = {
  root: {
    flexGrow: 1,
    height: 250,
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
    // margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`,
  },
  chipFocused: {
    /* backgroundColor: emphasize(
      // theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
      0.08,
    ), */
  },
  noOptionsMessage: {
    // padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
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
    // position: 'absolute',
    zIndex: 1,
    // marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
  }
};

class S3Form extends React.Component<Props, State> {
  state = {
    locationName: undefined,
    accessKey: undefined
  };

  suggestions = [
    { label: 'US East (Ohio)', value: 'us-east-2' },
    { label: 'US East (N. Virginia)', value: 'us-east-1' },
    { label: 'US West (N. California)', value: 'us-west-1' },
    { label: 'US West (Oregon)', value: 'us-west-2' },
    { label: 'Asia Pacific (Mumbai)', value: 'ap-south-1' },
    { label: 'Asia Pacific (Osaka-Local)', value: 'ap-northeast-3' },
    { label: 'Asia Pacific (Seoul)', value: 'ap-northeast-2' },
    { label: 'Asia Pacific (Singapore)', value: 'ap-southeast-1' },
    { label: 'Asia Pacific (Sydney)', value: 'ap-southeast-2' },
    { label: 'Asia Pacific (Tokyo)', value: 'ap-northeast-1' },
    { label: 'Canada (Central)', value: 'ca-central-1' },
    { label: 'China (Beijing)', value: 'cn-north-1' },
    { label: 'China (Ningxia)', value: 'cn-northwest-1' },
    { label: 'EU (Frankfurt)', value: 'eu-central-1' },
    { label: 'EU (Ireland)', value: 'eu-west-1' },
    { label: 'EU (London)', value: 'eu-west-2' },
    { label: 'EU (Paris)', value: 'eu-west-3' },
    { label: 'South America (São Paulo)', value: 'sa-east-1' },
  ].map(suggestion => ({
    value: suggestion.value,
    label: suggestion.label,
  }));

  handleChange = name => value => {
    this.setState({
      [name]: value,
    });
  };

  NoOptionsMessage = (props) => (
    <Typography
      color="textSecondary"
      // className={props.selectProps.classes.noOptionsMessage}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );

  inputComponent = ({ inputRef, ...props }) => <div ref={inputRef} {...props} />

  Control = (props) => (
    <TextField
      fullWidth
      InputProps={{
        inputComponent: this.inputComponent,
        inputProps: {
          style: styles.input,
          inputRef: props.innerRef,
          children: props.children,
          ...props.innerProps,
        },
      }}
      {...props.selectProps.textFieldProps}
    />
  )

  Option = (props) => (
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

  Placeholder = (props) => (
    <Typography
      color="textSecondary"
      style={styles.placeholder}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );

  SingleValue = (props) => (
    <Typography style={styles.singleValue} {...props.innerProps}>
      {props.children}
    </Typography>
  );

  ValueContainer = (props) => <div style={styles.valueContainer}>{props.children}</div>

  /* MultiValue = (props) => (
    <Chip
      tabIndex={-1}
      label={props.children}
      className={classNames(props.selectProps.classes.chip, {
        [props.selectProps.classes.chipFocused]: props.isFocused,
      })}
      onDelete={props.removeProps.onClick}
      deleteIcon={<CancelIcon {...props.removeProps} />}
    />
  ) */

  Menu = (props) => (
    <Paper square style={styles.paper} {...props.innerProps}>
      {props.children}
    </Paper>
  );

  components = {
    Control: this.Control,
    Menu: this.Menu,
    // MultiValue: this.MultiValue,
    NoOptionsMessage: this.NoOptionsMessage,
    Option: this.Option,
    Placeholder: this.Placeholder,
    SingleValue: this.SingleValue,
    ValueContainer: this.ValueContainer,
  };

  render() {
    // const { classes, theme } = this.props;
    const selectStyles = {
      input: base => ({
        ...base,
        // color: theme.palette.text.primary,
        flex: 1,
        '& input': {
          font: 'inherit',
        },
      }),
    };
    return (
      <Grid container spacing={24}>
        <Grid item xs={12}>
          <FormControl
            fullWidth={true}
            error={this.state.errorTextPath}
          >
            <InputLabel htmlFor="name">{i18n.t('core:createLocationName')}</InputLabel>
            <Input
              required
              margin="dense"
              name="name"
              label={i18n.t('core:createLocationName')}
              fullWidth={true}
              data-tid="locationName"
              onChange={this.handleInputChange}
              value={this.state.locationName}
            />
            {this.state.errorTextPath && <FormHelperText>{i18n.t('core:invalidPath')}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl
            fullWidth={true}
            error={this.state.errorTextPath}
          >
            <InputLabel htmlFor="accessKey">{i18n.t('core:accessKeyId')}</InputLabel>
            <Input
              required
              margin="dense"
              name="accessKey"
              label={i18n.t('core:accessKeyId')}
              fullWidth={true}
              data-tid="accessKeyId"
              onChange={this.handleInputChange}
              value={this.state.accessKey}
            />
            {this.state.errorTextPath && <FormHelperText>{i18n.t('core:invalidPath')}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl
            fullWidth={true}
            error={this.state.errorTextPath}
          >
            <InputLabel htmlFor="secretAccessKey">{i18n.t('core:secretAccessKey')}</InputLabel>
            <Input
              required
              margin="dense"
              name="secretAccessKey"
              label={i18n.t('core:secretAccessKey')}
              fullWidth={true}
              data-tid="secretAccessKey"
              onChange={this.handleInputChange}
              value={this.state.accessKey}
            />
            {this.state.errorTextPath && <FormHelperText>{i18n.t('core:invalidPath')}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl
            error={this.state.errorTextPath}
          >
            <InputLabel htmlFor="bucketName">{i18n.t('core:bucketName')}</InputLabel>
            <Input
              required
              margin="dense"
              name="bucketName"
              label={i18n.t('core:bucketName')}
              fullWidth={true}
              data-tid="bucketName"
              onChange={this.handleInputChange}
              value={this.state.accessKey}
            />
            {this.state.errorTextPath && <FormHelperText>{i18n.t('core:invalidPath')}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <NoSsr>
            <Select
              options={this.suggestions}
              styles={selectStyles}
              fullWidth={true}
              components={this.components}
              value={this.state.region}
              onChange={this.handleChange('region')}
              placeholder="Search a region"
            />
            {this.state.errorTextPath && <FormHelperText>{i18n.t('core:invalidPath')}</FormHelperText>}
          </NoSsr>
        </Grid>
      </Grid>
    );
  }
}

/* function mapStateToProps(state) {
  return {
  };
} */

/* function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    searchLocationIndex: AppActions.searchLocationIndex,
    loadDirectoryContent: AppActions.loadDirectoryContent
  }, dispatch);
} */

export default S3Form;
/*export default withStyles(styles)(
  S3Form
  // connect(mapStateToProps, mapDispatchToProps)(Search)
);*/
