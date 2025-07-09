import React, { useState } from 'react';
import {
  Container,
  VStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  useColorModeValue,
  Skeleton,
  Alert,
  AlertIcon,
  Icon,
  Box,
  Progress,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ChevronDownIcon, SearchIcon } from '@chakra-ui/icons';
import { FiBook, FiPlus, FiEye, FiEdit, FiTrash2, FiPlay, FiPause } from 'react-icons/fi';
import { format } from 'date-fns';
import { api } from '../services/api';

const NovelDashboard = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const cardBg = useColorModeValue('white', 'gray.800');

  const { data: novelsData, isLoading, error } = useQuery(
    ['novels', statusFilter, genreFilter],
    () => api.fetchNovels({ status: statusFilter !== 'all' ? statusFilter : undefined }),
    {
      keepPreviousData: true,
    }
  );

  const novels = novelsData?.novels || [];

  const filteredNovels = novels.filter(novel => {
    const matchesSearch = novel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         novel.premise?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = genreFilter === 'all' || novel.genre.primary === genreFilter;
    return matchesSearch && matchesGenre;
  });

  const statusColors = {
    planning: 'blue',
    outlining: 'cyan',
    drafting: 'yellow',
    reviewing: 'orange',
    completed: 'green',
    paused: 'gray',
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'drafting': return FiEdit;
      case 'completed': return FiBook;
      case 'paused': return FiPause;
      default: return FiPlay;
    }
  };

  if (error) {
    return (
      <Container maxW="6xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          Failed to load novels. Please try again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={2}>
            <Heading size="lg">My Novels</Heading>
            <Text color="gray.600">
              {isLoading ? 'Loading...' : `${filteredNovels.length} novels`}
            </Text>
          </VStack>
          <Button
            as={RouterLink}
            to="/create"
            leftIcon={<Icon as={FiPlus} />}
            colorScheme="brand"
          >
            New Novel
          </Button>
        </HStack>

        {/* Filters */}
        <HStack spacing={4} wrap="wrap">
          <InputGroup maxW="300px">
            <InputLeftElement>
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search novels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          <Select
            maxW="200px"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="outlining">Outlining</option>
            <option value="drafting">Drafting</option>
            <option value="reviewing">Reviewing</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </Select>

          <Select
            maxW="200px"
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
          >
            <option value="all">All Genres</option>
            <option value="Christian Fiction">Christian Fiction</option>
            <option value="Mystery">Mystery</option>
            <option value="Cozy Mystery">Cozy Mystery</option>
            <option value="Romance">Romance</option>
            <option value="Thriller">Thriller</option>
          </Select>
        </HStack>

        {/* Novels Grid */}
        {isLoading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} height="300px" rounded="md" />
            ))}
          </SimpleGrid>
        ) : filteredNovels.length === 0 ? (
          <VStack spacing={6} py={12}>
            <Icon as={FiBook} w={12} h={12} color="gray.400" />
            <VStack spacing={2} textAlign="center">
              <Heading size="md" color="gray.500">
                {searchTerm || statusFilter !== 'all' || genreFilter !== 'all'
                  ? 'No novels match your filters'
                  : 'No novels yet'}
              </Heading>
              <Text color="gray.500">
                {searchTerm || statusFilter !== 'all' || genreFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first novel to get started'}
              </Text>
            </VStack>
            {!(searchTerm || statusFilter !== 'all' || genreFilter !== 'all') && (
              <Button
                as={RouterLink}
                to="/create"
                leftIcon={<Icon as={FiPlus} />}
                colorScheme="brand"
              >
                Create First Novel
              </Button>
            )}
          </VStack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredNovels.map((novel) => (
              <Card key={novel._id} bg={cardBg} shadow="md" _hover={{ shadow: 'lg' }}>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {/* Novel Header */}
                    <VStack align="start" spacing={2}>
                      <HStack justify="space-between" width="100%">
                        <Badge colorScheme={statusColors[novel.status]}>
                          {novel.status}
                        </Badge>
                        <Menu>
                          <MenuButton as={Button} size="sm" variant="ghost">
                            <ChevronDownIcon />
                          </MenuButton>
                          <MenuList>
                            <MenuItem
                              as={RouterLink}
                              to={`/novel/${novel._id}`}
                              icon={<Icon as={FiEye} />}
                            >
                              View Details
                            </MenuItem>
                            <MenuItem
                              as={RouterLink}
                              to={`/novel/${novel._id}/chapter/1`}
                              icon={<Icon as={FiEdit} />}
                            >
                              Edit
                            </MenuItem>
                            <MenuItem icon={<Icon as={FiTrash2} />} color="red.500">
                              Delete
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </HStack>

                      <Heading size="md" noOfLines={2}>
                        {novel.title}
                      </Heading>

                      <HStack>
                        <Badge variant="outline" colorScheme="blue">
                          {novel.genre.primary}
                        </Badge>
                        <Icon as={getStatusIcon(novel.status)} color="gray.500" />
                      </HStack>
                    </VStack>

                    {/* Progress */}
                    {novel.progress && (
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm" color="gray.600">
                            Progress
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {novel.progress.currentChapter || 0} / {novel.progress.totalChapters || 0} chapters
                          </Text>
                        </HStack>
                        <Progress
                          value={novel.progress.percentComplete || 0}
                          colorScheme="brand"
                          size="sm"
                          rounded="md"
                        />
                      </Box>
                    )}

                    {/* Premise */}
                    <Text fontSize="sm" color="gray.600" noOfLines={3}>
                      {novel.premise || 'No premise available'}
                    </Text>

                    {/* Footer */}
                    <HStack justify="space-between" fontSize="xs" color="gray.500">
                      <Text>
                        Created {format(new Date(novel.createdAt), 'MMM d, yyyy')}
                      </Text>
                      <Text>
                        {novel.progress?.wordsWritten || 0} words
                      </Text>
                    </HStack>

                    {/* Action Button */}
                    <Button
                      as={RouterLink}
                      to={`/novel/${novel._id}`}
                      size="sm"
                      colorScheme="brand"
                      variant="outline"
                    >
                      Open Novel
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
};

export default NovelDashboard;
