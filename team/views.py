import json
from datetime import timedelta

from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponseForbidden
from django.shortcuts import render

from reservation.models import Reservation
from team.models import Team, TeamJoinRequest, TeamInvite


# Create your views here.
def team_main(request, pk):
    team = Team.objects.get(pk=pk)
    players = team.members.all()
    member_positions = team.member_positions
    players_position_zip = []
    for player in players:
        member_position = member_positions[str(player.id)]
        players_position_zip.append((player, {
            'top': str(member_position['top']).replace(',', '.'),
            'left': str(member_position['left']).replace(',', '.'),
            'color': member_position['color'],
        }))

    payment_reservations = Reservation.objects.filter(belonged_team=team)
    payment_reservations_intervals = []
    payment_reservations_dates = []
    payment_exp_dates = []
    for payment_reservation in payment_reservations:
        payment_reservations_intervals.append(
            f'{str(payment_reservation.start_hour).zfill(2)}.00-{str(payment_reservation.start_hour + 1).zfill(2)}.00')
        payment_reservations_dates.append(payment_reservation.date)
        payment_exp_dates.append(payment_reservation.creation_date + timedelta(seconds=Reservation.PAYMENT_TIMEOUT))

    payment_reservation_data = zip(payment_reservations,
                                   payment_reservations_intervals,
                                   payment_reservations_dates,
                                   payment_exp_dates)
    team_join_requests = team.incoming_requests.all()

    context = {'players': players,
               'player_positions': member_positions,
               'player_position_zip': players_position_zip,
               'payment_reservation_data': payment_reservation_data,
               'team_join_requests': team_join_requests,
               }
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

def accept_join_request(request, request_pk):
    join_request = TeamJoinRequest.objects.filter(pk=request_pk)
    if not join_request.exists():
        return HttpResponseForbidden('Fuck OFF')
    join_request = join_request.first()
    if request.user.profile != join_request.team.captain:
        return HttpResponseForbidden('Fuck OFF')
    for reservation in join_request.team.reservations.all():
        if reservation.status == 'payment':
            return JsonResponse({'success': False, 'message': 'Ödeme işlemi varken takıma üye eklenemez.'})

    join_request.team.members.add(join_request.sender)
    join_request.delete()
    return JsonResponse({'success': True})

def decline_join_request(request, request_pk):
    join_request = TeamJoinRequest.objects.filter(pk=request_pk)
    if not join_request.exists():
        return HttpResponseForbidden('Fuck OFF')
    join_request = join_request.first()
    if request.user.profile != join_request.team.captain:
        return HttpResponseForbidden('Fuck OFF')
    join_request.delete()
    return JsonResponse({'success': True})


def send_invite(request, team_pk):
    team = Team.objects.get(pk=team_pk)
    if not team.captain == request.user.profile:
        return JsonResponse({'success': False, 'error': 'Takıma birini davet edebilmek için kaptan olmalısınız!!!'})
    for reservation in team.reservations.all():
        if reservation.status == 'payment':
            return JsonResponse({'success': False, 'error': 'Takıma üye alabilmek için ilk önce bütün ödemeler tamamlanmalı veya iptal edilmeli!!!'})
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
    for reservation in invite.team.reservations.all():
        if reservation.status == 'payment':
            return JsonResponse({'success': False, 'message': 'Ödeme işlemi varken takıma üye eklenemez.'})

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


def send_member_positions(request, team_pk):
    team = Team.objects.get(pk=team_pk)
    if request.user.profile not in team.members.all():
        return HttpResponseForbidden('Fuck OFF')
    return JsonResponse({'success': True, 'playerPositions': team.member_positions})


def save_member_positions(request):
    data = json.loads(request.body.decode('utf-8'))
    team = Team.objects.get(pk=data['team_pk'])
    if request.user.profile not in team.members.all():
        return HttpResponseForbidden("Fuck OFF")
    for player in data['players']:
        player_position = team.member_positions[str(player['id'])]
        player_position['top'] = player['top']
        player_position['left'] = player['left']
        player_position['color'] = player['color']
    team.save()
    return JsonResponse({'success': True})
