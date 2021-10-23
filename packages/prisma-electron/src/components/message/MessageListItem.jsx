import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { __ } from 'lib/i18n';

// Components
import FlexContainer from 'components/FlexContainer';

import {
  Typography,
  ListItem,
  ListItemText,
} from '@material-ui/core';

// Helpers
import { formatTime } from 'components/message/helpers';

class MessageListItem extends React.Component {
  static propTypes = {
    message: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
    /**@private withStyles */
    classes: PropTypes.object.isRequired,
  };

  render() {
    const { message, onSelect, classes } = this.props;


    let time = formatTime(message.Time.seconds * 1000, 'lll z');
    let primaryText = '';
    if (message.Cscode || message.Csname) {
      switch(message.Direction) {
        case 1:
          primaryText = 'Sent to';
          break;
        case 2:
          primaryText = 'Received from';
          break;
        case 3:
          primaryText = 'Pending to';
          break;
        case 4:
          primaryText = 'Failed to';
          break;
      }

      if (message.Cscode) {
        if (message.Csname) {
          primaryText += ` ${message.Csname} (${message.Cscode}) `;
        } else {
          primaryText += ` ${message.Cscode} `;
        }
      } else if (message.Csname) {
        primaryText += ` ${message.Csname} `;
      }
    }

    primaryText += `over ${message.CommLinkType.toUpperCase()}`;

    let secondaryText = time;
    if (message.SitNumber == 185) {
      let firstLine = message.MessageBody.split("\n")[1];

      secondaryText += `\n${firstLine.replace(/1\.|DISTRESS|COSPAS-SARSAT/g, '').trim()}`;
    }

    return (
      <ListItem button onClick={() => onSelect(message)}>
        <ListItemText
          classes={{ secondary: classes.secondary }}
          primary={(
            <FlexContainer align="space-between center">
              <Typography variant="body2">{primaryText}</Typography>
              <Typography variant="caption">{`SIT ${message.SitNumber}`}</Typography>
            </FlexContainer>
          )}
          secondary={secondaryText}
        />
      </ListItem>
    );
  }
}

export default withStyles({
  secondary: {
    whiteSpace: 'pre-line',
  }
})(MessageListItem);