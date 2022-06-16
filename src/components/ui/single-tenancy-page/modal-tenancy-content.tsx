import React, { FC, useCallback, useState } from 'react'

import { DocumentModelPagedResult } from '@reapit/foundations-ts-definitions'
import { DndProvider, DropTargetMonitor, useDrop } from 'react-dnd'
import { HTML5Backend, NativeTypes } from 'react-dnd-html5-backend'
import { useModal } from '@reapit/elements'

import ModalDocumentDrop from './modal-document-drop'
import { useFetchDocumentTenancyCheck } from '../../../platform-api/document-api'

type ModalTenancyContentProps = {
  tenancyCheckId: string
  documentsData: DocumentModelPagedResult
}

const ModalTenancyContent: FC<ModalTenancyContentProps> = ({ tenancyCheckId, documentsData }) => {
  // const [listLabel]
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
        console.log(file)
        modalHandlerRest.openModal()
        setDroppedFiles(file)
      }
    },
    [setDroppedFiles],
  )

  const renderJSXElement = useCallback(
    (params: { documentsData: typeof documentsData }) => {
      return <ModalTenancyList onDrop={handleFileDrop} {...params} />
    },
    [handleFileDrop],
  )

  return (
    <>
      <DndProvider backend={HTML5Backend}>{renderJSXElement({ documentsData })}</DndProvider>
      <DroppedDocumentModal style={{ maxWidth: '500px' }}>
        <ModalDocumentDrop
          uploadedDocument={droppedFile}
          handleDroppedDocumentModal={handleDroppedDocumentModal}
          createDocument={createDocument}
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

const ModalTenancyList: FC<ModalTenancyListProps> = ({ onDrop }) => {
  const [, dropRef] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      drop(item: { files: File[] }) {
        console.log(item)
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

  return (
    <div ref={dropRef}>
      <h1>yo</h1>
    </div>
  )
}
