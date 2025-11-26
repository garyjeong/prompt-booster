/**
 * 휴지통(삭제된 채팅 기록) 목록 컴포넌트
 */

'use client';

import {
	Box,
	VStack,
	Text,
	Button,
	Flex,
	HStack,
	Spinner,
	IconButton,
	Badge,
} from '@chakra-ui/react';
import { ArrowBackIcon, RepeatIcon, DeleteIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { ChatSessionStorage } from '@/lib/storage';
import {
	getSessionList,
	restoreSession,
	permanentlyDeleteSession,
	clearTrashSessions,
} from '@/lib/storage';

interface TrashBinListProps {
	onBack: () => void;
}

export default function TrashBinList({ onBack }: TrashBinListProps) {
	const { status } = useSession();
	const [sessions, setSessions] = useState<ChatSessionStorage[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isClearing, setIsClearing] = useState(false);

	useEffect(() => {
		loadSessions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status]);

	const loadSessions = async () => {
		setIsLoading(true);
		try {
			const localSessions = getSessionList().sessions.filter(
				(session) => session.isDeleted
			);

			let mergedSessions = [...localSessions];

			if (status === 'authenticated') {
				try {
					const response = await fetch('/api/chat-sessions?status=trash');
					if (response.ok) {
						const result = await response.json();
						if (result?.success) {
							const serverSessions: ChatSessionStorage[] = result.data.map(
								(session: any) => ({
									...session,
									createdAt: new Date(session.createdAt),
									updatedAt: new Date(session.updatedAt),
									deletedAt: session.deletedAt ? new Date(session.deletedAt) : undefined,
									isDeleted: true,
								})
							);
							const map = new Map<string, ChatSessionStorage>();
							[...localSessions, ...serverSessions].forEach((session) => {
								map.set(session.sessionId, session);
							});
							mergedSessions = Array.from(map.values());
						}
					}
				} catch (error) {
					console.error('삭제된 세션 불러오기 실패:', error);
				}
			}

			setSessions(
				mergedSessions.sort(
					(a, b) =>
						new Date(b.deletedAt || b.updatedAt).getTime() -
						new Date(a.deletedAt || a.updatedAt).getTime()
				)
			);
		} finally {
			setIsLoading(false);
		}
	};

	const formatDate = (date?: Date | string | null) => {
		if (!date) return '-';
		const d = date instanceof Date ? date : new Date(date);
		return d.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	};

	const handleRestore = async (sessionId: string) => {
		restoreSession(sessionId);
		if (status === 'authenticated') {
			try {
				await fetch(`/api/chat-sessions/${sessionId}`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ action: 'restore' }),
				});
			} catch (error) {
				console.error('세션 복구 실패:', error);
			}
		}
		loadSessions();
	};

	const handlePermanentDelete = async (sessionId: string) => {
		permanentlyDeleteSession(sessionId);
		if (status === 'authenticated') {
			try {
				await fetch(`/api/chat-sessions/${sessionId}?force=true`, {
					method: 'DELETE',
				});
			} catch (error) {
				console.error('세션 완전 삭제 실패:', error);
			}
		}
		loadSessions();
	};

	const handleEmptyTrash = async () => {
		if (sessions.length === 0) return;
		setIsClearing(true);
		try {
			clearTrashSessions();
			if (status === 'authenticated') {
				await fetch('/api/chat-sessions?status=trash', {
					method: 'DELETE',
				});
			}
			await loadSessions();
		} catch (error) {
			console.error('휴지통 비우기 실패:', error);
		} finally {
			setIsClearing(false);
		}
	};

	return (
		<Flex direction="column" w="full" h="full" bg="white">
			<Flex
				justify="space-between"
				align="center"
				px={6}
				py={5}
				borderBottom="1px solid"
				borderColor="gray.200"
				bg="white"
				flexShrink={0}
			>
				<HStack spacing={3}>
					<IconButton
						aria-label="뒤로가기"
						icon={<ArrowBackIcon />}
						size="sm"
						variant="ghost"
						onClick={onBack}
					/>
					<Text fontSize="lg" fontWeight="600" color="gray.900">
						휴지통
					</Text>
					<Badge colorScheme="gray">{sessions.length}</Badge>
				</HStack>
				<Button
					size="sm"
					variant="outline"
					colorScheme="red"
					onClick={handleEmptyTrash}
					isDisabled={sessions.length === 0 || isClearing}
					isLoading={isClearing}
				>
					모두 비우기
				</Button>
			</Flex>

			<Box
				flex={1}
				overflowY="auto"
				px={4}
				py={4}
				css={{
					'&::-webkit-scrollbar': {
						width: '6px',
					},
					'&::-webkit-scrollbar-track': {
						background: 'transparent',
					},
					'&::-webkit-scrollbar-thumb': {
						background: '#d4d4d4',
						borderRadius: '3px',
					},
					'&::-webkit-scrollbar-thumb:hover': {
						background: '#a3a3a3',
					},
				}}
			>
				{isLoading ? (
					<VStack spacing={4} py={12} align="center">
						<Spinner size="lg" color="brand.500" />
						<Text fontSize="sm" color="gray.500">
							삭제된 채팅 기록을 불러오는 중...
						</Text>
					</VStack>
				) : sessions.length === 0 ? (
					<VStack spacing={4} py={12} align="center">
						<Text fontSize="md" color="gray.500">
							휴지통이 비어 있습니다.
						</Text>
						<Button size="sm" variant="outline" onClick={onBack}>
							돌아가기
						</Button>
					</VStack>
				) : (
					<VStack align="stretch" spacing={2}>
						{sessions.map((session) => (
							<Box
								key={session.sessionId}
								p={4}
								border="1px solid"
								borderColor="gray.200"
								borderRadius="md"
								bg="gray.50"
								_hover={{ borderColor: 'gray.300' }}
							>
								<Flex justify="space-between" align="start" gap={4}>
									<VStack align="start" spacing={1} flex={1}>
										<Text fontSize="sm" fontWeight="600" color="gray.900" noOfLines={1}>
											{session.title || '새 채팅'}
										</Text>
										<Text fontSize="xs" color="gray.500">
											{session.questionAnswers.length}개의 질문 · 삭제됨 {formatDate(session.deletedAt || session.updatedAt)}
										</Text>
									</VStack>
									<HStack spacing={1}>
										<IconButton
											aria-label="복구"
											icon={<RepeatIcon />}
											size="xs"
											variant="ghost"
											color="green.500"
											onClick={() => handleRestore(session.sessionId)}
											_hover={{ bg: 'green.50' }}
										/>
										<IconButton
											aria-label="완전 삭제"
											icon={<DeleteIcon />}
											size="xs"
											variant="ghost"
											color="red.500"
											onClick={() => handlePermanentDelete(session.sessionId)}
											_hover={{ bg: 'red.50' }}
										/>
									</HStack>
								</Flex>
							</Box>
						))}
					</VStack>
				)}
			</Box>
		</Flex>
	);
}

