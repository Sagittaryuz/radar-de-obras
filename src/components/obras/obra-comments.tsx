
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Send } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ObraComment } from '@/lib/firestore-data';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ObraCommentsProps {
    obraId: string;
}

function getInitials(name: string) {
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
}

function formatCommentTimestamp(timestamp: Timestamp | null) {
    if (!timestamp) return 'agora mesmo';
    return formatDistanceToNow(timestamp.toDate(), { addSuffix: true, locale: ptBR });
}

export function ObraComments({ obraId }: ObraCommentsProps) {
    const [comments, setComments] = useState<ObraComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Hardcoded current user for demonstration purposes
    const currentUser = {
        id: 'admin_user',
        name: 'Admin',
        avatar: 'https://placehold.co/100x100.png'
    };

    useEffect(() => {
        if (!obraId) return;

        const commentsCol = collection(db, 'obras', obraId, 'comments');
        const q = query(commentsCol, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ObraComment));
            setComments(commentsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching comments:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [obraId]);

    const handleAddComment = async () => {
        if (!newComment.trim() || !currentUser) return;

        setIsSubmitting(true);
        try {
            const commentsCol = collection(db, 'obras', obraId, 'comments');
            await addDoc(commentsCol, {
                obraId: obraId,
                userId: currentUser.id,
                userName: currentUser.name,
                userAvatar: currentUser.avatar,
                text: newComment,
                createdAt: serverTimestamp()
            });
            setNewComment('');
        } catch (error) {
            console.error("Error adding comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Histórico e Comentários
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Textarea 
                        placeholder="Adicionar um comentário sobre o orçamento, uma atualização ou anexo..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <div className="flex justify-end">
                        <Button onClick={handleAddComment} disabled={isSubmitting || !newComment.trim()}>
                            <Send className="mr-2 h-4 w-4" />
                            {isSubmitting ? 'Enviando...' : 'Enviar'}
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <>
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </>
                    ) : comments.length === 0 ? (
                        <p className="text-sm text-center text-muted-foreground py-4">
                            Nenhum comentário ainda. Seja o primeiro a adicionar uma atualização.
                        </p>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className="flex gap-3">
                                <Avatar>
                                    <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                                    <AvatarFallback>{getInitials(comment.userName)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-sm">{comment.userName}</p>
                                        <p className="text-xs text-muted-foreground">{formatCommentTimestamp(comment.createdAt as Timestamp)}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{comment.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
