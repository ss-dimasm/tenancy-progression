import React, { FC, ReactNode, useCallback, useState } from 'react'

import { Loader, PageContainer, useModal } from '@reapit/elements'
import { useParams } from 'react-router'

import { useFetchSingleTenancy } from '../../platform-api/tenancy-api'
import PreTenancyList from '../ui/single-tenancy-page/pre-tenancy-list'
import { useFetchDocumentTenancyCheck } from '../../platform-api/document-api'
import ModalTenancyContent from '../ui/single-tenancy-page/modal-tenancy-content'
import { useFetchConfiguration } from '../../platform-api/configuration-api'

type SingleTenancyPageType = {}

const SingleTenancyPage: FC<SingleTenancyPageType> = () => {
  const { tenancyId } = useParams<{ tenancyId: string }>()
  const { getSingleTenancy, getSingleTenancyChecks, patchSingleTenancyChecks } = useFetchSingleTenancy({
    id: tenancyId,
  })
  const { data: tenancyData } = getSingleTenancy({
    embed: ['documents', 'applicant', 'negotiator', 'property'],
  })
  const { data: tenancyChecksData } = getSingleTenancyChecks()

  // * Configuration data
  const { getDocumentTypes } = useFetchConfiguration()
  const { isFetched: documentTypesIsFetched } = getDocumentTypes()

  const renderJSXElement = useCallback(
    ({
      fetchedData,
      fetchedChecksData,
    }: {
      fetchedData: typeof tenancyData
      fetchedChecksData: typeof tenancyChecksData
    }): ReactNode => {
      if (fetchedData && fetchedChecksData && documentTypesIsFetched) {
        return (
          <PreTenancyList
            tenancyData={fetchedData}
            tenancyChecksData={fetchedChecksData}
            patchSingleTenancyChecks={patchSingleTenancyChecks}
            handleTenancyCheckModal={handleTenancyCheckDocumentModal}
          />
        )
      }
    },
    [documentTypesIsFetched],
  )

  // * Document Modal
  const { Modal: TenancyCheckDocumentModal, ...modalRest } = useModal('modal-root')
  const [selectedTenancyCheck, setSelectedTenancyCheckId] = useState<string | null>(null)
  const { getDocumentTenancyCheck } = useFetchDocumentTenancyCheck()
  const { data: documentSelectedTenancyCheck } = getDocumentTenancyCheck(selectedTenancyCheck)
  const handleTenancyCheckDocumentModal = useCallback(() => {
    const openDocumentModal = (params: string) => {
      setSelectedTenancyCheckId(params)
      modalRest.openModal()
    }

    const closeDocumentModal = () => {
      setSelectedTenancyCheckId(null)
      modalRest.closeModal()
    }

    return {
      openModal: openDocumentModal,
      closeModal: closeDocumentModal,
    }
  }, [])

  const renderJSXModalDocumentElement = useCallback(
    ({ documentData }: { documentData: typeof documentSelectedTenancyCheck }): JSX.Element => {
      if (documentData && selectedTenancyCheck) {
        return <ModalTenancyContent documentsData={documentData} tenancyCheckId={selectedTenancyCheck} />
      }

      return <Loader fullPage label="Please wait..." />
    },
    [selectedTenancyCheck],
  )

  return (
    <>
      <PageContainer>
        {renderJSXElement({
          fetchedData: tenancyData,
          fetchedChecksData: tenancyChecksData,
        })}
        <TenancyCheckDocumentModal>
          {/* <h1>hi - {documentSelectedTenancyCheck?.totalCount}</h1> */}
          {renderJSXModalDocumentElement({
            documentData: documentSelectedTenancyCheck,
          })}
        </TenancyCheckDocumentModal>
      </PageContainer>
    </>
  )
}

export default SingleTenancyPage
