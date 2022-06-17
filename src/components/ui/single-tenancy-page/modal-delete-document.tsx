import React, { FC, FormEvent } from 'react'

import { DocumentModel } from '@reapit/foundations-ts-definitions'
import { BodyText, Button, ButtonGroup } from '@reapit/elements'
import { useFetchDocumentTenancyCheck } from '../../../platform-api/document-api'
import { useQueryClient } from 'react-query'

type ModalDeleteDocumentProps = {
  documentData: DocumentModel
  closeModal: () => void
}

const ModalDeleteDocument: FC<ModalDeleteDocumentProps> = ({ documentData, closeModal }) => {
  const queryClient = useQueryClient()

  const { deleteDocumentTenancyCheck } = useFetchDocumentTenancyCheck()

  const { mutateAsync, isLoading } = deleteDocumentTenancyCheck(documentData.id!)

  const handleSubmit = () => async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    await mutateAsync(undefined, {
      onSuccess: () => {
        closeModal()
      },
      onSettled: () => {
        queryClient.invalidateQueries(['tenancy-check-document', documentData.associatedId])
      },
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit()}>
        <BodyText>Are you sure to delete this document?</BodyText>
        <ButtonGroup alignment="right" className="el-mt10">
          <Button type="submit" disabled={isLoading} loading={isLoading}>
            Delete
          </Button>
          <Button type="button" disabled={isLoading} loading={isLoading} intent="primary" onClick={closeModal}>
            Cancel
          </Button>
        </ButtonGroup>
      </form>
    </>
  )
}

export default ModalDeleteDocument
