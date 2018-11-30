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
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Slider from "react-slick";
import withMobileDialog from '@material-ui/core/withMobileDialog';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import i18n from '../../services/i18n';
import { loadFileContentPromise } from '../../services/utils-io';
import { Pro } from '../../pro';

type Props = {
  open: boolean,
  onClose: () => void
};

type State = {
  license?: string
};

class OnboardingDialog extends React.Component<Props, State> {
  state = {
    license: ''
  };

  slideSettings = {
    className: '',
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true
  };

  slider;

  showNext = () => {
    this.slider.slickNext();
  }

  showPrev = () => {
    this.slider.slickPrev();
  }

  renderTitle = () => <DialogTitle>Welcome to TagSpaces</DialogTitle>;

  renderContent = () => (
    <DialogContent style={{ height: 500, overflowX: 'hidden' }}>
      <Slider ref={slider => (this.slider = slider)} {...this.slideSettings}>
        <div style={{ height: 400, padding: 5 }}>
          <Paper elevation={1}>
            <Typography variant="h5" component="h3">
              This is a sheet of paper.
            </Typography>
            <Typography component="p">
              Paper can be used to build surface or other elements for your application.
            </Typography>
          </Paper>
        </div>
        <div style={{ height: 400 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Word of the Day
              </Typography>
              <Typography variant="h5" component="h2">
                be
                asda
                nev
                aasdasd
                lent
              </Typography>
              <Typography  color="textSecondary">
                adjective
              </Typography>
              <Typography component="p">
                well meaning and kindly.
                <br />
                {'"a benevolent smile"'}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">Learn More</Button>
            </CardActions>
          </Card>
        </div>
        <div style={{ height: 400 }}>
          <h3>3</h3>
          <p>See ....</p>
          <p>Height is adaptive</p>
        </div>
        <div style={{ height: 400 }}>
          <h3>4</h3>
        </div>
      </Slider>
    </DialogContent>
  );

  renderActions = () => (
    <DialogActions>
      <Button
        data-tid="confirmLicenseDialog"
        onClick={this.showPrev}
        color="primary"
      >
        Previous
      </Button>
      <Button
        data-tid="confirmLicenseDialog"
        onClick={this.showNext}
        color="primary"
      >
        Next
      </Button>
      <Button
        data-tid="confirmLicenseDialog"
        onClick={this.props.onClose}
        color="primary"
      >
        {i18n.t('core:closeButton')}
      </Button>
    </DialogActions>
  );

  render() {
    return (
      <GenericDialog
        open={this.props.open}
        onClose={this.props.onClose}
        // onEnterKey={(event) => onEnterKeyHandler(event, this.onConfirm)}
        renderTitle={this.renderTitle}
        renderContent={this.renderContent}
        renderActions={this.renderActions}
      />
    );
  }
}

export default withMobileDialog()(OnboardingDialog);
