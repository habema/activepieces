import { CreateFolderRequest, FolderId, ListFolderRequest } from '@/shared/src'
import { FastifyInstance, FastifyRequest } from 'fastify'
import { flowFolderService as folderService } from './folder.service'
import { StatusCodes } from 'http-status-codes'
import { Static, Type } from '@sinclair/typebox'

const DEFUALT_PAGE_SIZE = 10


const FolderIdParam = Type.Object({
    folderId: Type.String(),
})

type FolderIdParam = Static<typeof FolderIdParam>

export const folderController = async (fastify: FastifyInstance) => {

    fastify.post(
        '/',
        {
            schema: {
                body: CreateFolderRequest,
            },
        },
        async (
            request: FastifyRequest<{
                Body: CreateFolderRequest
            }>,
        ) => {
            return await folderService.create({ projectId: request.principal.projectId, request: request.body })
        },
    )


    fastify.post(
        '/:folderId',
        {
            schema: {
                params: FolderIdParam,
                body: CreateFolderRequest,
            },
        },
        async (
            request: FastifyRequest<{
                Params: FolderIdParam
                Body: CreateFolderRequest
            }>,
        ) => {
            return await folderService.update({ projectId: request.principal.projectId, folderId: request.params.folderId, request: request.body })
        },
    )

    fastify.get(
        '/',
        {
            schema: {
                querystring: ListFolderRequest,
            },
        },
        async (
            request: FastifyRequest<{
                Querystring: ListFolderRequest
            }>,
        ) => {
            return await folderService.list({ projectId: request.principal.projectId, cursorRequest: request.query.cursor ?? null, limit: request.query.limit ?? DEFUALT_PAGE_SIZE })
        },
    )


    fastify.delete(
        '/:folderId',
        async (
            request: FastifyRequest<{
                Params: {
                    folderId: FolderId
                }
            }>,
            _reply,
        ) => {
            await folderService.delete({ projectId: request.principal.projectId, folderId: request.params.folderId })
            _reply.status(StatusCodes.OK).send()
        },
    )
}
