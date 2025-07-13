import React, { useState } from 'react';
import { Star, Send, MessageCircle, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  menuItemId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  isApproved: boolean;
}

interface ReviewSystemProps {
  menuItemId: string;
}

export function ReviewSystem({ menuItemId }: ReviewSystemProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newReview, setNewReview] = useState({
    userName: '',
    rating: 5,
    comment: ''
  });
  
  const [showForm, setShowForm] = useState(false);

  // Fetch reviews for this menu item
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['/api/reviews/menuitem', menuItemId],
    queryFn: async () => {
      const response = await fetch(`/api/reviews/menuitem/${menuItemId}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json();
    }
  });

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: typeof newReview & { menuItemId: string }) => {
      return await apiRequest('/api/reviews', {
        method: 'POST',
        body: JSON.stringify(reviewData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/menuitem', menuItemId] });
      setNewReview({ userName: '', rating: 5, comment: '' });
      setShowForm(false);
      toast({
        title: t('reviewSubmitted'),
        description: t('reviewSubmittedDesc'),
      });
    },
    onError: () => {
      toast({
        title: t('error'),
        description: t('reviewSubmissionError'),
        variant: 'destructive',
      });
    }
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReview.userName.trim() && newReview.comment.trim()) {
      createReviewMutation.mutate({ ...newReview, menuItemId });
    }
  };

  const renderStars = (rating: number, interactive = false, size = 'w-4 h-4') => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300 dark:text-gray-600'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={interactive ? () => setNewReview(prev => ({ ...prev, rating: i + 1 })) : undefined}
      />
    ));
  };

  const approvedReviews = reviews.filter((review: Review) => review.isApproved);
  const averageRating = approvedReviews.length > 0 
    ? approvedReviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / approvedReviews.length
    : 0;

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            {t('loadingReviews')}
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          {t('reviews')} ({approvedReviews.length})
        </CardTitle>
        {approvedReviews.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {renderStars(Math.round(averageRating))}
            <span>{averageRating.toFixed(1)} {t('outOf')} 5</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Review Form */}
        {!showForm ? (
          <Button 
            onClick={() => setShowForm(true)}
            className="w-full"
            variant="outline"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {t('writeReview')}
          </Button>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4 p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userName">{t('name')}</Label>
                <Input
                  id="userName"
                  value={newReview.userName}
                  onChange={(e) => setNewReview(prev => ({ ...prev, userName: e.target.value }))}
                  placeholder={t('enterName')}
                  required
                />
              </div>
              <div>
                <Label>{t('rating')}</Label>
                <div className="flex items-center gap-1 mt-1">
                  {renderStars(newReview.rating, true, 'w-6 h-6')}
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="comment">{t('comment')}</Label>
              <Textarea
                id="comment"
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder={t('writeComment')}
                rows={3}
                required
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={createReviewMutation.isPending}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                {createReviewMutation.isPending ? t('submitting') : t('submitReview')}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                {t('cancel')}
              </Button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {approvedReviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t('noReviewsYet')}</p>
              <p className="text-sm">{t('beFirst')}</p>
            </div>
          ) : (
            approvedReviews.map((review: Review) => (
              <div key={review.id} className="border rounded-lg p-4 bg-card">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">{review.userName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}