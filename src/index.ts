import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  INotebookTracker
} from '@jupyterlab/notebook';

import { Cell, CodeCell } from '@jupyterlab/cells';

import { PanelLayout } from '@lumino/widgets';

import { CodeCellCollapser } from './widget'


interface INotebookCellCollapsers {
    [id: string]: CodeCellCollapser;
}


/**
 * Helper method
 */
const addCodeCellCollapser = (cell: Cell, tracker: INotebookCellCollapsers) => {
  if (cell.model.type === 'code' && !tracker[cell.model.id]) {
    const collapser = new CodeCellCollapser(cell as CodeCell);
    tracker[cell.model.id] = collapser;
    (cell.inputArea.layout as PanelLayout).insertWidget(0, collapser);
  }
};


/**
 * Initialization data for the jupyterlab-code-cell-collapser extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-code-cell-collapser',
  requires: [INotebookTracker],
  autoStart: true,
  activate: (
      app: JupyterFrontEnd,
      nbTrack: INotebookTracker,
  ) => {
    nbTrack.currentChanged.connect(() => {

      const notebookCellCollapsers: INotebookCellCollapsers = {};
      const notebookPanel = nbTrack.currentWidget;

      if (notebookPanel === null) {
        return
      }

      const notebook = nbTrack.currentWidget.content;

      notebookPanel.context.ready.then(async () => {

        // Iterate over all code cells and create a collapser
        // for each that exists
        notebook.widgets.map((c: Cell) => {
          addCodeCellCollapser(c, notebookCellCollapsers);
        });

        nbTrack.activeCellChanged.connect(() => {
          const cell: Cell = notebook.activeCell;
          if (cell !== null) {
            addCodeCellCollapser(cell, notebookCellCollapsers);
          }
        });

      });

    })
  }
};

export default extension;
