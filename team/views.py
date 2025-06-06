import json

from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponseForbidden
from django.shortcuts import render

from team.models import Team, TeamJoinRequest, TeamInvite
from user.models import AppUserProfile


# Create your views here.
def team_main(request, pk):
    team = Team.objects.get(pk=pk)
    context = {'players': team.members.all(),}
    return render(request, 'team_main.html', context)


def send_teams(request):
    team_objects = Team.objects.filter(members__in=[request.user.profile])
    teams = []
    for team_object in team_objects:
        teams.append({
            'id': team_object.id,
            'name': team_object.name,
            'member_count': team_object.members.count(),
            'captain_username': team_object.captain.user.username,
            'wins': team_object.wins,
            'losses': team_object.losses,
        })
    return JsonResponse({'teams': teams})


def create_team(request):
    data = json.loads(request.body.decode('utf-8'))
    team_name = data['name']
    team = Team.objects.create(name=team_name, captain=request.user.profile)
    team.members.add(request.user.profile)
    team.save()
    return JsonResponse({
        'id': team.id,
        'name': team.name,
        'member_count': team.members.count(),
        'captain_username': team.captain.user.username,
        'wins': team.wins,
        'losses': team.losses,
    })


def delete_team(request, pk):
    team = Team.objects.get(pk=pk)
    if team.captain == request.user.profile:
        team.delete()
    else:
        return JsonResponse({'success': False, 'error': 'Bu takımın kaptanı değilsiniz!!!'})
    return JsonResponse({'success': True})


def search_team(request):
    data = json.loads(request.body.decode('utf-8'))
    search_term = data['search_term']
    team_objects = Team.objects.filter(name__icontains=search_term)
    sent_request_objects = request.user.profile.sent_requests.all()
    teams = []
    sent_requests = []
    for team_object in team_objects:
        teams.append({
            'id': team_object.id,
            'name': team_object.name,
            'member_count': team_object.members.count(),
            'captain_username': team_object.captain.user.username,
        })
    for sent_request_object in sent_request_objects:
        sent_requests.append(sent_request_object.team.id)
    return JsonResponse({'teams': teams, 'sent_requests': sent_requests})


def send_join_request(request, team_pk):
    team = Team.objects.get(pk=team_pk)
    TeamJoinRequest.objects.create(
        team=team,
        sender=request.user.profile,
    )
    return JsonResponse({'success': True})


def send_invite(request, team_pk):
    team = Team.objects.get(pk=team_pk)
    if not team.captain == request.user.profile:
        return JsonResponse({'success': False, 'error': 'Takıma birini davet edebilmek için kaptan olmalısınız!!!'})
    data = json.loads(request.body.decode('utf-8'))
    recipient = data['username']
    recipient = User.objects.filter(username__exact=recipient)
    if not recipient.exists():
        return JsonResponse({'success': False, 'error': 'Bu kullanıcı adına sahip bir kullanıcı bulunamadı...'})
    recipient = recipient.first().profile
    TeamInvite.objects.create(
        team=team,
        recipient=recipient,
    )
    return JsonResponse({'success': True})


def accept_invite(request, invite_pk):
    invite = TeamInvite.objects.filter(pk=invite_pk)
    if not invite.exists():
        return HttpResponseForbidden('Fuck OFF')
    invite = invite.first()
    if request.user.profile != invite.recipient:
        return HttpResponseForbidden('Fuck OFF')

    invite.team.members.add(invite.recipient)
    invite.delete()
    return JsonResponse({'success': True})


def deny_invite(request, invite_pk):
    invite = TeamInvite.objects.filter(pk=invite_pk)
    if not invite.exists():
        return HttpResponseForbidden('Fuck OFF')
    invite = invite.first()
    if request.user.profile != invite.recipient:
        return HttpResponseForbidden('Fuck OFF')
    invite.delete()
    return JsonResponse({'success': True})
