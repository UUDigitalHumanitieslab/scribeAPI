import React from "react";
import API from "../lib/api.jsx";
import { AppContext } from "./app.jsx";

@AppContext
export default class GroupBrowser extends React.Component {
  constructor() {
    super();
    this.state = { groups: [] };
  }

  componentDidMount() {
    const project_id = this.props.project.id;
    API.type("groups")
      .get({ project_id })
      .then(groups => {
        for (let group of groups) {
          // hide buttons by default
          group.showButtons = false;
        }
        this.setState({ groups });
      });
  }

  showButtonsForGroup(group, e) {
    group.showButtons = true;
    // trigger re-render to update buttons
    this.forceUpdate();
  }

  hideButtonsForGroup(group, e) {
    group.showButtons = false;
    // trigger re-render to update buttons
    this.forceUpdate();
  }

  renderGroup(group) {
    const buttonContainerClasses = [];
    const groupNameClasses = [];
    if (group.showButtons) {
      buttonContainerClasses.push("active");
    } else {
      groupNameClasses.push("active");
    }

    return (
      <div
        onMouseOver={this.showButtonsForGroup.bind(this, group)}
        onMouseOut={this.hideButtonsForGroup.bind(this, group)}
        className="group"
        style={{ backgroundImage: `url(${group.cover_image_url})` }}
        key={group.id}
      >
        <div className={`button-container ${buttonContainerClasses.join(" ")}`}>
          {(() => {
            const result = [];
            for (let workflow of this.props.project.workflows) {
              const workflowCounts = group.stats.workflow_counts != null &&
                group.stats.workflow_counts[workflow.id];
              if ((workflowCounts && workflowCounts.active_subjects != null
                ? workflowCounts.active_subjects
                : 0) > 0) {
                result.push(
                  <a href={`/#/${workflow.name}?group_id=${group.id}`}
                    className="button small-button"
                    key={workflow.id}>
                    {workflow.name.capitalize()}
                  </a>
                );
              } else {
                result.push(undefined);
              }
            }

            return result;
          })()}
          <a href={`/#/groups/${group.id}`} className="button small-button ghost">More info</a>
        </div>
        <p className={`group-name ${groupNameClasses.join(" ")}`}>{group.name}</p>
      </div>
    );
  }

  render() {
    // Only display GroupBrowser if more than one group defined:
    if (this.state.groups.length <= 1) {
      return null;
    }

    const groups = [
      this.state.groups.map(group => this.renderGroup(group))
    ];
    return (
      <div className="group-browser">
        <h3 className="groups-header">
          {this.props.title != null &&
            <span>{this.props.title}</span> ||
            <span>Select a {this.props.project.term("group")}</span>}
        </h3>
        <div className="groups">{groups}</div>
      </div>
    );
  }
};
