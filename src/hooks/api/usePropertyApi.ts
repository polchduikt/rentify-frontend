import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { propertyService, type UnavailableRangesQuery } from '@/services/propertyService';
import type { PageQuery } from '@/types/api';
import type {
  AvailabilityBlockRequestDto,
  PropertyCreateRequestDto,
  PropertySearchCriteriaDto,
  PropertyStatusUpdateRequestDto,
} from '@/types/property';
import { queryKeys } from '@/api/queryKeys';

export const useAllPropertiesQuery = (page?: PageQuery, enabled = true) =>
  useQuery({
    queryKey: queryKeys.properties.all(page),
    queryFn: () => propertyService.getAllProperties(page),
    enabled,
  });

export const useMyPropertiesQuery = (page?: PageQuery) =>
  useQuery({
    queryKey: queryKeys.properties.mine(page),
    queryFn: () => propertyService.getMyProperties(page),
  });

export const usePropertyByIdQuery = (id: number, enabled = true) =>
  useQuery({
    queryKey: queryKeys.properties.byId(id),
    queryFn: () => propertyService.getPropertyById(id),
    enabled: enabled && Number.isFinite(id) && id > 0,
  });

export const useSearchPropertiesQuery = (
  criteria?: PropertySearchCriteriaDto,
  page?: PageQuery,
  enabled = true
) =>
  useQuery({
    queryKey: queryKeys.properties.search(criteria, page),
    queryFn: () => propertyService.searchProperties(criteria, page),
    enabled,
  });

export const useSearchPropertyMapPinsQuery = (
  criteria?: PropertySearchCriteriaDto,
  page?: PageQuery,
  enabled = true
) =>
  useQuery({
    queryKey: queryKeys.properties.mapPins(criteria, page),
    queryFn: () => propertyService.searchMapPins(criteria, page),
    enabled,
  });

export const useAvailabilityBlocksQuery = (propertyId: number, enabled = true) =>
  useQuery({
    queryKey: queryKeys.properties.availability(propertyId),
    queryFn: () => propertyService.getAvailabilityBlocks(propertyId),
    enabled: enabled && Number.isFinite(propertyId) && propertyId > 0,
  });

export const useUnavailableRangesQuery = (propertyId: number, query?: UnavailableRangesQuery, enabled = true) =>
  useQuery({
    queryKey: queryKeys.properties.unavailableRanges(propertyId, query),
    queryFn: () => propertyService.getUnavailableRanges(propertyId, query),
    enabled: enabled && Number.isFinite(propertyId) && propertyId > 0,
  });

export const useCreatePropertyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PropertyCreateRequestDto) => propertyService.createProperty(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
};

export const useUpdatePropertyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PropertyCreateRequestDto }) =>
      propertyService.updateProperty(id, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['properties'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.properties.byId(variables.id) });
    },
  });
};

export const useDeletePropertyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => propertyService.deleteProperty(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
};

export const useUploadPropertyPhotoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, file }: { propertyId: number; file: File }) =>
      propertyService.uploadPhoto(propertyId, file),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.properties.byId(variables.propertyId) });
    },
  });
};

export const useDeletePropertyPhotoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, photoId }: { propertyId: number; photoId: number }) =>
      propertyService.deletePhoto(propertyId, photoId),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.properties.byId(variables.propertyId) });
    },
  });
};

export const useCreateAvailabilityBlockMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, payload }: { propertyId: number; payload: AvailabilityBlockRequestDto }) =>
      propertyService.createAvailabilityBlock(propertyId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.properties.availability(variables.propertyId) });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.properties.unavailableRanges(variables.propertyId),
      });
    },
  });
};

export const useDeleteAvailabilityBlockMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, blockId }: { propertyId: number; blockId: number }) =>
      propertyService.deleteAvailabilityBlock(propertyId, blockId),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.properties.availability(variables.propertyId) });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.properties.unavailableRanges(variables.propertyId),
      });
    },
  });
};

export const useChangePropertyStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, payload }: { propertyId: number; payload: PropertyStatusUpdateRequestDto }) =>
      propertyService.changePropertyStatus(propertyId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['properties'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.properties.byId(variables.propertyId) });
    },
  });
};
