/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/** @jsx React.DOM */
const React = require("react");
const { Navigation } = require("react-router");
const SubjectViewer = require("../subject-viewer");
const JSONAPIClient = require("json-api-client"); // use to manage data?
const FetchSubjectsMixin = require("lib/fetch-subjects-mixin");
const ForumSubjectWidget = require("../forum-subject-widget");

const BaseWorkflowMethods = require("lib/workflow-methods-mixin");

const DraggableModal = require("../draggable-modal");
const GenericButton = require("../buttons/generic-button");
const Tutorial = require("../tutorial");
const HelpModal = require("../help-modal");

// Hash of core tools:
const coreTools = require("../core-tools");

// Hash of transcribe tools:
const verifyTools = require("./tools");

const API = require("lib/api");

module.exports = React.createClass({
  // rename to Classifier
  displayName: "Verify",
  mixins: [FetchSubjectsMixin, BaseWorkflowMethods, Navigation], // load subjects and set state variables: subjects,  classification

  getDefaultProps() {
    return { workflowName: "verify" };
  },

  getInitialState() {
    return {
      taskKey: null,
      classifications: [],
      classificationIndex: 0,
      subject_index: 0,
      showingTutorial: false,
      helping: false
    };
  },

  componentWillMount() {
    return this.beginClassification();
  },

  fetchSubjectsCallback() {
    if (this.getCurrentSubject() != null) {
      return this.setState({ taskKey: this.getCurrentSubject().type });
    }
  },

  // Handle user selecting a pick/drawing tool:
  handleDataFromTool(d) {
    const { classifications } = this.state;
    const currentClassification =
      classifications[this.state.classificationIndex];

    for (let k in d) {
      const v = d[k];
      currentClassification.annotation[k] = v;
    }

    this.forceUpdate();
    return this.setState({ classifications }, () => this.forceUpdate());
  },

  handleTaskComplete(d) {
    this.handleDataFromTool(d);
    return this.commitClassificationAndContinue(d);
  },

  toggleTutorial() {
    return this.setState({ showingTutorial: !this.state.showingTutorial });
  },

  hideTutorial() {
    return this.setState({ showingTutorial: false });
  },

  toggleHelp() {
    return this.setState({ helping: !this.state.helping });
  },

  render() {
    const currentAnnotation = this.getCurrentClassification().annotation;

    const onFirstAnnotation =
      (currentAnnotation != null ? currentAnnotation.task : undefined) ===
      this.getActiveWorkflow().first_task;

    return (
      <div className="classifier">
        <div className="subject-area">
          {(() => {
            if (this.getCurrentSubject() == null) {
              return (
                <DraggableModal
                  header={
                    this.state.userClassifiedAll
                      ? "You verified them all!"
                      : "Nothing to verify"
                  }
                  buttons={<GenericButton label="Continue" href="/#/mark" />}
                >
                  {`\
Currently, there are no `}
                  {this.props.project.term("subject")}s for you to{" "}
                  {this.props.workflowName}. Try <a href="/#/mark">marking</a>
                  {` instead!\
`}
                </DraggableModal>
              );
            } else if (this.getCurrentSubject() != null) {
              let VerifyComponent;
              return (
                <SubjectViewer
                  onLoad={this.handleViewerLoad}
                  subject={this.getCurrentSubject()}
                  active={true}
                  workflow={this.getActiveWorkflow()}
                  classification={this.props.classification}
                  annotation={currentAnnotation}
                >
                  {(VerifyComponent = this.getCurrentTool()) != null ? (
                    <VerifyComponent
                      viewerSize={this.state.viewerSize}
                      task={this.getCurrentTask()}
                      annotation={this.getCurrentClassification().annotation}
                      onShowHelp={
                        this.getCurrentTask().help != null
                          ? this.toggleHelp
                          : undefined
                      }
                      badSubject={this.state.badSubject}
                      onBadSubject={this.toggleBadSubject}
                      subject={this.getCurrentSubject()}
                      onChange={this.handleTaskComponentChange}
                      onComplete={this.handleTaskComplete}
                      workflow={this.getActiveWorkflow()}
                      project={this.props.project}
                    />
                  ) : (
                      undefined
                    )}
                </SubjectViewer>
              );
            }
          })()}
        </div>
        {this.getCurrentSubject() != null ? (
          <div className="right-column">
            <div className="task-area verify">
              <div className="task-secondary-area">
                {this.getCurrentTask() != null ? (
                  <p>
                    <a className="tutorial-link" onClick={this.toggleTutorial}>
                      View A Tutorial
                    </a>
                  </p>
                ) : undefined}
                <div className="forum-holder">
                  <ForumSubjectWidget
                    subject={this.getCurrentSubject()}
                    project={this.props.project}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
            undefined
          )}
        {this.props.project.tutorial != null && this.state.showingTutorial ? (
          // Check for workflow-specific tutorial
          this.props.project.tutorial.workflows != null &&
            this.props.project.tutorial.workflows[__guard__(this.getActiveWorkflow(), x => x.name)] ? (
              <Tutorial tutorial={this.props.project.tutorial.workflows[this.getActiveWorkflow().name]} onCloseTutorial={this.hideTutorial} />
            ) : (
              // Otherwise just show general tutorial
              <Tutorial tutorial={this.props.project.tutorial} onCloseTutorial={this.hideTutorial} />
            )
        ) : undefined}
        {this.state.helping ? (
          <HelpModal help={this.getCurrentTask().help} onDone={() => this.setState({ helping: false })} />
        ) : undefined}
      </div>
    );
  }
});

window.React = React;

function __guard__(value, transform) {
  return typeof value !== "undefined" && value !== null
    ? transform(value)
    : undefined;
}
