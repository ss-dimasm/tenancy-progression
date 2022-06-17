import React, { FC, useCallback, useMemo, useState } from 'react'

import { DocumentModel, DocumentModelPagedResult } from '@reapit/foundations-ts-definitions'
import { DndProvider, DropTargetMonitor, useDrop } from 'react-dnd'
import { HTML5Backend, NativeTypes } from 'react-dnd-html5-backend'
import { Button, ButtonGroup, elSpan2, RowProps, Table, useModal } from '@reapit/elements'
import dayjs from 'dayjs'

import ModalDocumentDrop from './modal-document-drop'
import { useFetchDocumentTenancyCheck } from '../../../platform-api/document-api'
import ModalDeleteDocument from './modal-delete-document'
import ModalEditDocument from './modal-edit-document'

type ModalTenancyContentProps = {
  tenancyCheckId: string
  documentsData: DocumentModelPagedResult
}

const ModalTenancyContent: FC<ModalTenancyContentProps> = ({ tenancyCheckId, documentsData }) => {
  const [droppedFile, setDroppedFiles] = useState<File[]>([])

  const { createDocumentTenancyCheck } = useFetchDocumentTenancyCheck()

  const createDocument = createDocumentTenancyCheck(tenancyCheckId)

  const { Modal: DroppedDocumentModal, ...modalHandlerRest } = useModal('modal-root')
  const handleDroppedDocumentModal = useCallback(() => {
    const closeModal = () => {
      modalHandlerRest.closeModal()
    }

    const openModal = () => {
      modalHandlerRest.openModal()
    }

    return {
      closeDroppedDocumentModal: closeModal,
      openDroppedDocumentModal: openModal,
    }
  }, [])

  const handleFileDrop = useCallback(
    ({ file }: { file: File[] }) => {
      if (file) {
        modalHandlerRest.openModal()
        setDroppedFiles(file)
      }
    },
    [setDroppedFiles],
  )

  const renderJSXElement = useCallback(
    (params: { documentsData: typeof documentsData }) => {
      if (params.documentsData) {
        return <ModalTenancyList onDrop={handleFileDrop} {...params} />
      }
    },
    [handleFileDrop],
  )

  return (
    <>
      <DndProvider backend={HTML5Backend}>{renderJSXElement({ documentsData })}</DndProvider>
      <DroppedDocumentModal style={{ maxWidth: '500px' }} title={`Upload document - ${tenancyCheckId}`}>
        <ModalDocumentDrop
          uploadedDocument={droppedFile}
          handleDroppedDocumentModal={handleDroppedDocumentModal}
          createDocument={createDocument}
          tenancyCheckId={tenancyCheckId}
        />
      </DroppedDocumentModal>
    </>
  )
}

export default ModalTenancyContent

type ModalTenancyListProps = {
  onDrop: (item: { file: File[] }) => void
  documentsData: DocumentModelPagedResult
}

const ModalTenancyList: FC<ModalTenancyListProps> = ({ onDrop, documentsData }) => {
  const [, dropRef] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      drop(item: { files: File[] }) {
        if (onDrop) {
          onDrop({ file: item.files })
        }
      },
      canDrop() {
        return true
      },
      collect: (monitor: DropTargetMonitor) => {
        return {
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop(),
        }
      },
    }),
    [onDrop],
  )

  // * Download document handler
  const { downloadDocumentTenancyCheck } = useFetchDocumentTenancyCheck()
  const { mutate: downloadDocument } = downloadDocumentTenancyCheck()

  // * Modal handler
  const { Modal: ChangeDocModal, ...changeDocHandlerRest } = useModal('modal-root')
  const [changeDocModalContent, setChangeDocModalContent] = useState<'edit-doc' | 'delete-doc' | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<DocumentModel | null>(null)
  const handleChangeDocModal = useCallback((params: DocumentModel) => {
    const openModal = (type: Exclude<typeof changeDocModalContent, null>) => {
      setChangeDocModalContent(type)
      setSelectedDocument(params)
      changeDocHandlerRest.openModal()
    }

    const closeModal = () => {
      changeDocHandlerRest.closeModal()
      setSelectedDocument(null)
      setChangeDocModalContent(null)
    }

    return {
      openModal,
      closeModal,
    }
  }, [])
  const renderJSXChangeDocModal = useMemo(
    (): {
      [val in Exclude<typeof changeDocModalContent, null>]: {
        title: string
        content: JSX.Element
      }
    } => ({
      'edit-doc': {
        title: 'Edit document',
        content: (
          <ModalEditDocument
            documentData={selectedDocument!}
            closeModal={handleChangeDocModal(selectedDocument!).closeModal}
          />
        ),
      },
      'delete-doc': {
        title: 'Delete document',
        content: (
          <ModalDeleteDocument
            documentData={selectedDocument!}
            closeModal={handleChangeDocModal(selectedDocument!).closeModal}
          />
        ),
      },
    }),
    [selectedDocument],
  )

  // *
  const renderTableCellsContent = useCallback((): RowProps[] => {
    if (documentsData && !!documentsData._embedded?.length) {
      return documentsData._embedded.map((val) => ({
        cells: [
          {
            label: 'Type',
            value: val.typeId,
            icon: 'docsMenu',
            cellHasDarkText: true,
            narrowTable: {
              showLabel: true,
            },
          },
          {
            label: 'File Name',
            value: val.name,
            className: elSpan2,
            icon: 'usernameSystem',
            narrowTable: {
              showLabel: true,
            },
          },
          {
            label: 'Modified',
            value: dayjs(val.modified).format('DD/MM/YYYY'),
          },
        ],
        expandableContent: {
          content: (
            <>
              <ButtonGroup>
                <Button
                  onClick={() => {
                    downloadDocument(
                      {
                        tenancyCheckIdParams: val.id!,
                        documentNameParams: val.name!,
                      },
                      {
                        onError(error, variables, context) {
                          console.log('error', error)
                          console.log('variable', variables)
                          console.log('context', context)
                        },
                      },
                    )
                  }}
                >
                  Download Docs
                </Button>
                <Button onClick={() => handleChangeDocModal(val).openModal('edit-doc')}>Edit Docs</Button>
                <Button onClick={() => handleChangeDocModal(val).openModal('delete-doc')}>Delete Docs</Button>
              </ButtonGroup>
            </>
          ),
        },
      }))
    }
    return []
  }, [documentsData])

  return (
    <div ref={dropRef} style={{ minHeight: '250px' }}>
      <Table numberColumns={5} rows={renderTableCellsContent()} />
      <ChangeDocModal title={renderJSXChangeDocModal?.[changeDocModalContent!]?.title} style={{ maxWidth: '500px' }}>
        {renderJSXChangeDocModal?.[changeDocModalContent!]?.content}
      </ChangeDocModal>
    </div>
  )
}
