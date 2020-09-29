import { ReactWidget } from '@jupyterlab/apputils';

import { CodeCell } from '@jupyterlab/cells';

import { CodeMirrorEditor } from "@jupyterlab/codemirror";

import { caretDownIcon, caretUpIcon, LabIcon } from '@jupyterlab/ui-components';

import React, { useState, useEffect } from 'react';

const CELL_INPUT_AREA_COLLAPSED_CLASS = 'jp-Cell-inputAreaCollapsed';


/**
 * isFirstLineComment
 *
 * Note: Helper method to determine whether the cell contains a valid
 * comment on the first line
 *
 * @param cell - The CodeCell parent.
 */
const isFirstLineComment = (cell: CodeCell): boolean => {
  const cm = (cell.editor as CodeMirrorEditor)['_editor']; // Find a better way
  const pattern = /^#[\sa-zA-Z]+/i;
  return !!pattern.test(cm.getLine(0));
};


/**
 * CollapseButton
 *
 * Note: A react component rendering a simple button with a jupyterlab icon
 *
 * @param onClick - Method to call when the button is clicked.
 * @param collapsed - Bool determining whether the up or down caret is shown
 */
interface ICollapseButton {
  onClick: () => void;
  collapsed: boolean;
}

const CollapseButton = ({
  onClick,
  collapsed=false,
}: ICollapseButton) => (
  <button
      type="button"
      onClick={() => onClick()}
      className="collapseButton">
    <LabIcon.resolveReact
        icon={collapsed ? caretUpIcon : caretDownIcon}
        className="collapseButton-icon"
        tag="span"
        width="10px"
        height="15px"
    />
  </button>
);



/**
 * CodeCellCollapserComponent
 *
 * Note: Handles showing a collapser button if there
 * is a comment on the first line of the input, toggling
 * the cell's visual state between partially collapsed
 * and open, and storing the additional state in the
 * metadata object.
 *
 * @param cell - The CodeCell parent.
 */
interface ICodeCellCollapserComponent {
  cell: CodeCell;
}

const CodeCellCollapserComponent = ({
  cell,
}: ICodeCellCollapserComponent): JSX.Element => {
  const metadata = cell.model.metadata;
  const [isCollapsible, setIsCollapsible] = useState(isFirstLineComment(cell));
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSetCollapsed = () => {
    cell.inputArea.toggleClass(CELL_INPUT_AREA_COLLAPSED_CLASS);

    if (!isCollapsed) {
      metadata.set('partialCollapse', true);
    } else {
      metadata.delete('partialCollapse');
    }

    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const initiallyCollapsed = metadata.get('partialCollapse') as boolean;

    if (initiallyCollapsed) {
      setIsCollapsed(initiallyCollapsed);
      cell.inputArea.addClass(CELL_INPUT_AREA_COLLAPSED_CLASS);
    }

    cell.inputArea.model.contentChanged.connect(() => {
      setIsCollapsible(isFirstLineComment(cell))
    });
  }, []);

  return isCollapsible ?
      <CollapseButton
        onClick={() => handleSetCollapsed()}
        collapsed={isCollapsed}
      />
     : <React.Fragment />;
};


export class CodeCellCollapser extends ReactWidget {
  /**
   * Constructs a new CodeCellCollapser widget.
   */
  cell: CodeCell = null;

  constructor(cell: CodeCell) {
    super();
    this.cell = cell;
    this.addClass('jp-CodeCellCollapser');
  }

  render(): JSX.Element {
    return <CodeCellCollapserComponent cell={this.cell} />
  }
}
