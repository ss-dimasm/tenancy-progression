import React, { FC } from 'react'

import { Button, ButtonGroup, FlexContainer, Input, Select, Subtitle } from '@reapit/elements'
import { UseMutationResult, useQueryClient } from 'react-query'
import { ListItemModel } from '@reapit/foundations-ts-definitions'
import { useForm } from 'react-hook-form'
import mime from 'mime'

import { CreateDocumentTenancyCheck } from '../../../platform-api/document-api'

type ModalDocumentDropProps = {
  tenancyCheckId: string
  uploadedDocument: File[]
  handleDroppedDocumentModal: () => {
    closeDroppedDocumentModal: () => void
    openDroppedDocumentModal: () => void
  }
  createDocument: UseMutationResult<any, unknown, CreateDocumentTenancyCheck, unknown>
}

const ModalDocumentDrop: FC<ModalDocumentDropProps> = ({
  tenancyCheckId,
  uploadedDocument,
  handleDroppedDocumentModal,
  createDocument,
}) => {
  const queryClient = useQueryClient()
  const documentTypesData = queryClient.getQueryData<ListItemModel[]>('document-types')

  const { register, getValues, handleSubmit } = useForm({
    defaultValues: {
      docName: uploadedDocument[0].name.split('.')[0],
      docExtension: mime.getExtension(uploadedDocument[0].type),
      docType: 'LET',
      docFile: '',
    },
  })

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((res, rej) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => res(reader.result as string)
      reader.onerror = (error) => rej(error)
    })
  }

  const { mutateAsync, isLoading } = createDocument

  const submitDataValue = async () => {
    const convertedFile = await convertToBase64(uploadedDocument[0])

    await mutateAsync(
      {
        typeId: getValues('docType'),
        fileData: convertedFile,
        name: `${getValues('docName')}.${getValues('docExtension')}`,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['tenancy-check-document', tenancyCheckId])
          console.log('success upload')
        },
        onError: () => {
          console.log('error')
        },
      },
    )
    handleDroppedDocumentModal().closeDroppedDocumentModal()
  }

  return (
    <>
      <Subtitle>Document Properties</Subtitle>
      <form
        onSubmit={handleSubmit(async () => {
          try {
            await submitDataValue()
          } catch (e: unknown) {
            console.error(e)
            throw new Error()
          }
        })}
      >
        <FlexContainer isFlexAlignEnd>
          <Input type="text" {...register('docName')} />
          <Subtitle hasNoMargin className="el-pl6">
            .{getValues('docExtension')}
          </Subtitle>
        </FlexContainer>
        <Select defaultValue="Letters" {...register('docType')} className="el-mt4">
          {documentTypesData?.map((val) => (
            <option key={val.id} value={val.id}>
              {val.value}
            </option>
          ))}
        </Select>
        <ButtonGroup alignment="right" className="el-mt6">
          <Button
            onClick={handleDroppedDocumentModal().closeDroppedDocumentModal}
            disabled={isLoading}
            loading={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" intent="primary" disabled={isLoading} loading={isLoading}>
            Save
          </Button>
        </ButtonGroup>
      </form>
    </>
  )
}

export default ModalDocumentDrop
